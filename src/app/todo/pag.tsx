// app/todo/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function TodoPage() {
    const [todos, setTodos] = useState<unknown[]>([]);

    useEffect(() => {
        fetch('/api/todo')
            .then(res => res.json())
            .then(data => setTodos(data || []));
    }, []);

    return (
        <div>
            <h1>ToDo一覧</h1>
            <ul>
                {todos.map((item, index) => (
                    <li key={index}>{JSON.stringify(item)}</li>
                ))}
            </ul>
        </div>
    );
}
