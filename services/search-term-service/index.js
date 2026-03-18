const naturalLanguageToSearchTerms = (question) => {
    // Use NLP techniques to process the question
    const optimizedTerms = processQuestion(question);
    return optimizedTerms;
};

const processQuestion = (question) => {
    // Placeholder for actual NLP implementation
    // For now, let's return a dummy array of search terms
    return question.split(' ').map(word => word.toLowerCase());
};

module.exports = naturalLanguageToSearchTerms;