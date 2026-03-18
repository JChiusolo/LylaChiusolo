import React, { useState } from 'react';

const QueryInput = () => {
    const [query, setQuery] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateQuery(query)) {
            // Handle valid query submission
            console.log('Query submitted:', query);
            setQuery('');
            setError('');
        } else {
            setError('Please enter a valid medical question.');
        }
    };

    const validateQuery = (query) => {
        // Basic validation - can be enhanced as needed
        return query.trim().length > 0;
    };

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="query">Medical Question:</label>
            <input
                type="text"
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
            />
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <button type="submit">Submit</button>
        </form>
    );
};

export default QueryInput;