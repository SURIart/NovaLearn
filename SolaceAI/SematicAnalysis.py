from transformers import pipeline
from sentence_transformers import SentenceTransformer, util
from nltk.tokenize import sent_tokenize


classifier = pipeline(task="zero-shot-classification", model="facebook/bart-large-mnli", device=0)
embedding_model = SentenceTransformer('all-MiniLM-L6-v2', device=0)

def classify_text_topic(text: str, topic: str)-> dict:
    """Classifies whether a given text is related to a specified topic using zero-shot classification."""
    labels = [topic, "unrelated"]
    results = classifier(text, labels)
    
    return {
        "best_match": results["labels"][0],
        "confidence": results["scores"][0]
    }

def semantic_similarity(sentence: str, topic: str):
    """Computes semantic similarity between a sentence and a topic using Sentence-BERT embeddings."""
    sentence_embedding = embedding_model.encode(sentence, convert_to_tensor=True)
    topic_embedding = embedding_model.encode(topic, convert_to_tensor=True)
    
    similarity_score = util.pytorch_cos_sim(sentence_embedding, topic_embedding).item()
    return similarity_score

def extract_sentences(text: str)->list[str]:
    """Extracts and tokenizes sentences from the given text."""
    sentences = []
    for line in text.split('\n'):
        if line.strip():
            sentences.extend(sent_tokenize(line.strip()))
    return sentences


#for calculating Semantic coherence by averaging classification confidence and similarity score ranging it between [-0.5,1]
def semantic_coherence_score(text:str,topic:str):
    sentences = extract_sentences(text)
    sentence_scores = []
    
    for sentence in sentences:
        classification = classify_text_topic(sentence, topic)
        similarity = semantic_similarity(sentence, topic)
        # Average the confidence and similarity for this sentence:
        sentence_score = (classification['confidence'] + similarity) / 2
        sentence_scores.append(sentence_score)
    
    # Compute overall average score
    SC = sum(sentence_scores) / len(sentence_scores)

    # Normalize SC to range [-0.5, 1] using min-max scaling
    SC_final = -0.5 + 0.75 * SC
    
    return SC_final



   