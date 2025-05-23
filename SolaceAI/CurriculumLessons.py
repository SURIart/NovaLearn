from LessonGen import get_lessons
from CurriculumGen import get_Curriculum
import json
import asyncio

class LessonData:
    def __init__(self):
        self.curriculum = ""
        self.lessons = []
        self.description = ""
        self.EstimtedCompeletionTime = ""

    async def get_Lessons(self, curriculum: str):
        LessonData = await get_Curriculum(curriculum)
        self.curriculum = LessonData["curriculum"]
        self.lessons = LessonData["lessons"]
        self.description = LessonData["description"]
        self.EstimtedCompeletionTime = LessonData["EstimatedCompeletionTime"]


    async def get_lesson_details(self):
        async def lesson_generator():
            # First, yield the curriculum and lesson list as initial metadata
            initial_data = {
                "Curriculum": self.curriculum,
                "Lessons": self.lessons,
                "Description": self.description,
                "EstimatedCompeletionTime": self.EstimtedCompeletionTime,
            }
            yield json.dumps(initial_data) + "\n"

            # Now, stream each lesson detail
            for lesson in self.lessons:
                Lesson = await get_lessons(lesson)
                yield json.dumps(Lesson) + "\n"  # Send each lesson as a JSON string

                await asyncio.sleep(0.1)  # Small delay to control streaming speed

        return lesson_generator()




