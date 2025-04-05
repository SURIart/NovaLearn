import os
from openai import OpenAI

model = "mistral-large-latest"

async def memory_assessment(client):

    chat_response = client.chat.complete(
    model = model,
    messages = [
        {
            "role":"system",
            "content":"you are a questions generator. Generate quality questions that satisfies the user prompt."
        },
        {
            "role": "user",
            "content": """Generate a paragraph of approximately 100 words that contains enough information to create six MCQs, such that these 6 MCQs will be asked from the generated paragraph.

                        The paragraph should contain facts, events, and relationships that can be recalled directly or with slight inference.

                        There should be 2 easy, 2 medium, and 2 hard multiple-choice questions,all of them shuffled with no sub topics as easy, hard, medium . 

                        Easy: Direct recall of explicit facts from the paragraph.
                        Medium: Requires slight inference or understanding of relationships. 
                        Hard: Requires deeper memory and indirect recall.

                        Important: The six MCQs must be randomly shuffled in the final output, with no order based on difficulty level.

                        Each question should have 4 answer choices, one correct answer, and a difficulty level. the difficulty level should be numbers 1 for easy, 3 for medium, 5 for hard. and correct answer should have only the option a,b,c or d not the whole answer.

                        the response should be in the following json format exactly.
                        {{
                            "paragraph": "generated paragraph",
                            "questions": [ 
                                {{
                                    "question": "Your question here",
                                    "choices": [
                                        ["A", "Your first choice here"],
                                        ["B", "Your second choice here"],
                                        ["C", "Your third choice here"],
                                        ["D", "Your fourth choice here"]
                                    ],
                                    "correct_answer": "Correct choice letter (e.g., 'A')",
                                    "difficulty": "Choose from: 1,3,5"
                                }}
                            ]
                        }}

                        

                        """,
        },
    ]
    )

    return chat_response.choices[0].message.content


async def logical_assessment(client)->str:
    
    chat_response = client.chat.complete(
    model = model,
    messages = [
        {
            "role":"system",
            "content":"you are a questions generator. Generate quality questions that satisfies the user prompt."
        },
        {
        "role": "user",
        "content": """Generate 3 easy, 3 medium, and 3 hard logical/analytical questions in the form of multiple-choice questions, all of them shuffled with no sub topics as easy, hard, medium . Each question should have 4 answer choices, one correct answer, and a difficulty level. the difficulty level should be numbers 1 for easy, 3 for medium, 5 for hard. and correct answer should have only the option a,b,c or d not the whole answer. 

                    Important: The nine MCQs must be randomly shuffled in the final output, with no order based on difficulty level.

                    the response should be in the following json format exactly. 
                    {{
                        "logical/analytical": [ 
                            {{
                                "question": "Your question here",
                                "choices": [
                                    ["A", "Your first choice here"],
                                    ["B", "Your second choice here"],
                                    ["C", "Your third choice here"],
                                    ["D", "Your fourth choice here"]
                                ],
                                "correct_answer": "Correct choice letter (e.g., 'A')",
                                "difficulty": "Choose from: 1,3,5"
                            }}
                        ]
                    }}
                        """
        },
    ]
    )

    return chat_response.choices[0].message.content

async def comprehension_assessment(client)->str:
    
    chat_response = client.chat.complete(
    model = model,
    messages = [
        {
            "role":"system",
            "content":"you are a questions generator. Generate quality questions that satisfies the user prompt."
        },
        {
        "role": "user",
        "content": """Generate a paragraph of approximately 100 words that contains enough information to create six MCQs, such that these 6 MCQs will be asked from the generated paragraph.

                    The paragraph should contain facts, events, and relationships that can be recalled directly or with slight inference.

                    There should be 2 easy, 2 medium, and 2 hard multiple-choice questions, 

                    Easy: Direct recall of explicit facts from the paragraph.
                    Medium: Requires slight inference or understanding of relationships. 
                    Hard: Requires deeper memory and indirect recall.

                    Important: The six MCQs must be randomly shuffled in the final output, with no order based on difficulty level.

                    all of them shuffled with no sub topics as easy, hard, medium . Each question should have 4 answer choices, one correct answer, and a difficulty level. the difficulty level should be numbers 1 for easy, 3 for medium, 5 for hard. and correct answer should have only the option a,b,c or d not the whole answer.
                    the response should be in the following json format exactly.
                    {
                        "paragraph": "generated paragraph",
                        "questions": [ 
                            {
                                "question": "Your question here",
                                "choices": [
                                    ["A", "Your first choice here"],
                                    ["B", "Your second choice here"],
                                    ["C", "Your third choice here"],
                                    ["D", "Your fourth choice here"]
                                ],
                                "correct_answer": "Correct choice letter (e.g., 'A')",
                                "difficulty": "Choose from: 1,3,5"
                            }
                        ]
                    }


                    """
        },
    ]
    )

    return chat_response.choices[0].message.content

async def topic_assessment(client,topic)->str:
    
    chat_response = client.chat.complete(
    model = model,
    messages = [
        {
            "role":"system",
            "content":"you are a questions generator. Generate quality questions that satisfies the user prompt."
        },
        {
        "role": "user",
        "content": f"""Generate 3 easy, 3 medium, and 3 hard multiple-choice questions, all of them shuffled with no sub topics as easy, hard, medium  on the topic "{topic}". Each question should have 4 answer choices, one correct answer, and a difficulty level. the difficulty level should be numbers 1 for easy, 3 for medium, 5 for hard. and correct answer should have only the option a,b,c or d not the whole answer. 

                    Important: The nine MCQs must be randomly shuffled in the final output, with no order based on difficulty level.

                    the response should be in the following json format exactly.
                    {{
                        {topic}: [
                            {{
                                "question": "Your question here",
                                "choices": [
                                    ["A", "Your first choice here"],
                                    ["B", "Your second choice here"],
                                    ["C", "Your third choice here"],
                                    ["D", "Your fourth choice here"]
                                ],
                                "correct_answer": "Correct choice letter (e.g., 'A')",
                                "difficulty": "Choose from: 1,3,5"
                            }}
                        ]
                    }}



                    """
        },
    ]
    )

    return chat_response.choices[0].message.content

