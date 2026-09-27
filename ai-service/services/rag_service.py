"""
RAG service — Retrieval-Augmented Generation for the recruiter assistant.

This version uses structured MongoDB data (passed from Express) as context,
NOT vector search. The retrieval happens in Express (authorization-scoped
MongoDB queries), and this service handles context formatting + LLM generation.
"""

import logging

from services.llm_service import llm_service

logger = logging.getLogger(__name__)


def _format_candidate_context(candidate_data: list[dict]) -> str:
    """Format candidate data as readable text for the LLM context."""
    if not candidate_data:
        return "No candidate data available."

    context_parts = []
    for c in candidate_data:
        parts = [f"Candidate: {c.get('name', 'Unknown')}"]

        skills = c.get("skills", [])
        if skills:
            parts.append(f"  Skills: {', '.join(skills)}")

        experience = c.get("experience", [])
        if experience:
            if isinstance(experience, list) and experience:
                if isinstance(experience[0], dict):
                    exp_strs = [
                        f"{e.get('role', '?')} at {e.get('company', '?')} ({e.get('duration', '?')})"
                        for e in experience
                    ]
                    parts.append(f"  Experience: {'; '.join(exp_strs)}")
                else:
                    parts.append(f"  Experience: {'; '.join(str(e) for e in experience)}")

        match_scores = c.get("matchScores", [])
        if match_scores:
            score_strs = [
                f"{m.get('job', '?')}: {m.get('score', '?')}%"
                for m in match_scores
            ]
            parts.append(f"  Match Scores: {'; '.join(score_strs)}")

        interview_score = c.get("interviewScore")
        if interview_score is not None:
            parts.append(f"  Interview Score: {interview_score}%")

        education = c.get("education", [])
        if education:
            parts.append(f"  Education: {'; '.join(education)}")

        context_parts.append("\n".join(parts))

    return "\n\n".join(context_parts)


def _format_job_context(job_data: list[dict]) -> str:
    """Format job data as readable text for the LLM context."""
    if not job_data:
        return "No job data available."

    parts = []
    for j in job_data:
        reqs = j.get("requirements", [])
        req_str = f", Requirements: {', '.join(reqs)}" if reqs else ""
        parts.append(
            f"Job: {j.get('title', '?')} at {j.get('company', '?')} "
            f"(Location: {j.get('location', '?')}, Type: {j.get('jobType', '?')}{req_str})"
        )
    return "\n".join(parts)


def _format_recruiter_context(recruiter_info: dict | None) -> str:
    """Format logged-in recruiter info for conversational grounding."""
    if not recruiter_info:
        return "Role: Recruiter / Hiring Manager"
    name = recruiter_info.get("name", "Recruiter")
    email = recruiter_info.get("email", "")
    role = recruiter_info.get("role", "Recruiter")
    return f"Name: {name}\nRole: {role}\nEmail: {email}"


async def assistant_query(
    question: str,
    candidate_data: list[dict],
    job_data: list[dict],
    conversation_history: list[dict] | None = None,
    recruiter_info: dict | None = None,
) -> dict:
    """
    Intelligent Recruiter Assistant: works like ChatGPT for general/conversational/tech
    questions, and applies grounded RAG over candidate & job data for recruitment queries.
    Dynamically decides the appropriate mode based on the user's intent.
    """
    candidate_context = _format_candidate_context(candidate_data)
    job_context = _format_job_context(job_data)
    recruiter_context = _format_recruiter_context(recruiter_info)

    system_prompt = """You are an intelligent, versatile AI Assistant built into a modern Job & Recruitment Portal. You work like ChatGPT with specialized access to the recruiter's candidate and job database (RAG).

DECIDE DYNAMICALLY HOW TO ANSWER BASED ON THE USER'S INTENT:

1. RECRUITMENT & CANDIDATE QUERIES (RAG Mode):
   - When the question is about candidates, applicants, resumes, skills, match scores, interviews, rankings, or job requirements:
   - Ground your factual answers in the provided Candidate Data and Job Data below.
   - Always mention specific candidates by name, citing their match scores, verified skills, missing requirements, or project details.
   - Never invent candidate credentials, experience, or scores not found in the data. If a specific detail isn't in their profile, state that honestly.

2. GENERAL, CONVERSATIONAL & TECHNICAL QUESTIONS (ChatGPT Mode):
   - For greetings (e.g. "hi", "hello", "how are you"), conversational remarks, general knowledge, programming/tech concepts (e.g. "what is React?", "difference between SQL and NoSQL"), industry advice, or recruitment tips:
   - Answer naturally, conversationally, helpfully, and comprehensively like ChatGPT.
   - NEVER say "I don't have enough data to answer that" for general, conversational, conceptual, or tech questions.
   - When asked "who are you", introduce yourself as the Job Portal's AI Assistant, ready to help with candidate analysis, recruitment workflows, drafting communications, or answering any general questions.
   - When asked "who am I", answer using the Recruiter Context (their name, role, email).

3. DRAFTING & OUTREACH (Hybrid Mode):
   - When asked to write an email, invitation, job description, or message to candidates, combine the candidate and job data with generative writing to produce polished, professional text.

STYLE & FORMATTING:
- Use clean Markdown with headings, bullet points, and bold text for readability.
- Be warm, professional, engaging, and articulate."""

    # Build conversation context
    history_text = ""
    if conversation_history:
        recent = conversation_history[-10:]  # Last 10 messages for context window
        for msg in recent:
            role = "Recruiter" if msg.get("role") == "user" else "Assistant"
            history_text += f"{role}: {msg.get('content', '')}\n"

    user_prompt = f"""=== Recruiter Context ===
{recruiter_context}

=== Candidate Data ===
{candidate_context}

=== Job Postings ===
{job_context}

{f"=== Previous Conversation ==={chr(10)}{history_text}" if history_text else ""}
Recruiter's Question: {question}"""

    try:
        answer = await llm_service.generate(user_prompt, system_prompt)
    except Exception as e:
        logger.error("RAG query failed: %s", e)
        answer = "I'm sorry, I encountered an error processing your question. Please try again."

    # Extract referenced candidate names from the answer only if they are actually in candidateData
    candidate_names = [c.get("name", "") for c in candidate_data if c.get("name")]
    sources_used = [name for name in candidate_names if name.lower() in answer.lower()]

    return {
        "answer": answer,
        "sourcesUsed": sources_used,
    }


def _format_student_context(student_data: dict | None) -> str:
    """Format student/candidate profile data for LLM context."""
    if not student_data:
        return "No student profile data available."

    parts = [
        f"Name: {student_data.get('name', 'Candidate')}",
        f"Email: {student_data.get('email', 'N/A')}",
    ]

    bio = student_data.get("bio")
    if bio:
        parts.append(f"Bio: {bio}")

    skills = student_data.get("skills", [])
    if skills:
        parts.append(f"Skills: {', '.join(skills)}")

    suggested_roles = student_data.get("suggestedRoles", [])
    if suggested_roles:
        parts.append(f"Target/Suggested Roles: {', '.join(suggested_roles)}")

    experience = student_data.get("experience", [])
    if experience:
        if isinstance(experience, list) and experience and isinstance(experience[0], dict):
            exp_strs = [
                f"{e.get('role', '?')} at {e.get('company', '?')} ({e.get('duration', '?')})"
                for e in experience
            ]
            parts.append(f"Experience: {'; '.join(exp_strs)}")
        else:
            parts.append(f"Experience: {'; '.join(str(e) for e in experience)}")

    education = student_data.get("education", [])
    if education:
        parts.append(f"Education: {'; '.join(str(e) for e in education)}")

    summary = student_data.get("resumeSummary")
    if summary:
        parts.append(f"Resume Summary: {summary}")

    return "\n".join(parts)


async def student_assistant_query(
    question: str,
    student_data: dict,
    job_data: list[dict],
    conversation_history: list[dict] | None = None,
) -> dict:
    """
    Intelligent AI Career Coach & Job Mentor for students/job seekers.
    Combines RAG (student profile + active jobs) with ChatGPT-style career & technical coaching.
    """
    student_context = _format_student_context(student_data)
    job_context = _format_job_context(job_data)

    system_prompt = """You are an encouraging, expert AI Career Coach and Job Search Mentor built into a modern Job Portal. You work like ChatGPT, but you have personalized access to the student's profile/resume and the active jobs listed on the portal.

DECIDE DYNAMICALLY HOW TO ASSIST THE STUDENT:

1. JOB MATCHING & RECOMMENDATIONS (RAG Mode):
   - When asked which jobs fit them, what jobs to apply for, or their chances for a role:
   - Analyze the student's skills against the actual Job Postings provided below.
   - Name the exact job titles and companies available on the portal.
   - Highlight matched skills and specify if any required skills are missing.
   - Explain why a role is a strong or moderate match.

2. SKILL GAP & RESUME FEEDBACK (RAG Mode):
   - When asked how to improve, what skills to learn, or resume feedback:
   - Identify in-demand technologies in the active job postings that the student hasn't listed yet.
   - Recommend high-impact projects, certifications, or modern tools to bridge those gaps.

3. MOCK INTERVIEW & PREPARATION (ChatGPT Mode):
   - When asked to practice interview questions:
   - Ask realistic technical and behavioral interview questions tailored to their stack and desired role.
   - Evaluate their answers with constructive feedback and model answer tips.

4. COVER LETTERS & OUTREACH (Drafting Mode):
   - When asked to draft a cover letter or message to recruiters:
   - Draft compelling, professional, customized text highlighting their actual skills and passion for the specific job.

5. GENERAL TECH, CODING & CAREER GUIDANCE (ChatGPT Mode):
   - Answer all technical, coding, algorithmic, or general career questions (e.g., "explain useEffect", "difference between SQL and MongoDB", "how to negotiate salary", "how are you", "who are you").
   - Never refuse a general or technical question.
   - When asked "who are you", introduce yourself as the Student's AI Career Coach & Job Mentor.
   - When asked "who am I", address the student by their name and mention their current profile skills.

STYLE & FORMATTING:
- Use clean Markdown with headings, bullet points, and code formatting.
- Maintain an inspiring, actionable, supportive, and professional tone."""

    history_text = ""
    if conversation_history:
        recent = conversation_history[-10:]
        for msg in recent:
            role = "Student" if msg.get("role") == "user" else "Coach"
            history_text += f"{role}: {msg.get('content', '')}\n"

    user_prompt = f"""=== Student Profile ===
{student_context}

=== Active Job Postings on Portal ===
{job_context}

{f"=== Previous Conversation ==={chr(10)}{history_text}" if history_text else ""}
Student's Question: {question}"""

    try:
        answer = await llm_service.generate(user_prompt, system_prompt)
    except Exception as e:
        logger.error("Student AI query failed: %s", e)
        answer = "I'm sorry, I encountered an issue preparing your career guidance. Please try asking again!"

    # Identify any job titles mentioned in the answer as sources
    job_titles = [j.get("title", "") for j in job_data if j.get("title")]
    sources_used = [title for title in job_titles if title.lower() in answer.lower()]

    return {
        "answer": answer,
        "sourcesUsed": sources_used,
    }


