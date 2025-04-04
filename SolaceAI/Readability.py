from nltk import word_tokenize,sent_tokenize
from Dale_Chall import Dale_chall_list
import nltk


class Readability:
    # initialzing the text and other variables
    def __init__(self,text:str):
        self.text =text
        self.words=[]
        self.sentences=[]
        self.syllables=0
        self._word_extraction()
        self._sent_extraction()
        self._syllable_counting()
    #extracting words from text as tokens
    def _word_extraction(self):
        self.words= word_tokenize(self.text)
        self.words=[w for w in self.words if w.isalpha()]
    #extracting senteces from text as tokens
    def _sent_extraction(self):
        lines=self.text.split('\n')
        for line in lines:
            line=line.strip()
            if line:
                sentences = sent_tokenize(line)
                self.sentences.extend(sentences)

    #counting syllables of whole text
    def _syllable_counting(self):
        for w in self.words:
            self.syllables+= self._syllables(w)

    # counting syllables of a word token
    def _syllables(self,word: str):
        syllable_count = 0
        vowels = "aeiouy"
        if word[0] in vowels:
            syllable_count += 1
        for index in range(1, len(word)):
            if word[index] in vowels and word[index - 1] not in vowels:
                syllable_count += 1
        if word.endswith("e"):
            syllable_count -= 1
        if word.endswith("le") and len(word) > 2 and word[-3] not in vowels:
            syllable_count += 1
        if syllable_count == 0:
            syllable_count += 1
        return syllable_count
    
    #Caculating Flesch-Kincaid  ease score
    def Flesch_Readbility(self):
        word_count=len(self.words)
        sent_count=len(self.sentences)
        flesch_score=206.835-1.015*(word_count/sent_count)-84.6*(self.syllables/word_count)
        return flesch_score
    
    #Calculating Dale-Chall Readability Score
    def DaleChall_Readability(self):
        word_count=len(self.words)
        sent_count=len(self.sentences)
        difficult_count= 0
        for w in self.words:
            if w not in Dale_chall_list:
                difficult_count += 1
        dale_score= 0.1579*((difficult_count/word_count)*100)+0.0496*(word_count/sent_count)
        return dale_score
    
    # averaging Flesch score and dalechall score
    def Readability_score(self):
        flesch_score=self.Flesch_Readbility()
        dale_score = self.DaleChall_Readability()
        return (flesch_score+dale_score)/2
    
