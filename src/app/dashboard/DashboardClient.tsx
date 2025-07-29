'use client';
import { callApi } from "@/lib/apiClient";
import { decodeIdToken } from "@/lib/auth/decodeIdToken";
import { SessionData } from "@/lib/session";
import { getLayoutOrPageModule } from "next/dist/server/lib/app-dir-module";
import { useEffect, useState } from "react";

type Todo = {
    userId: string;
    taskId: string;
    Task: string; // APIのデータに合わせて "Task"（必要なら "title" に変更）
    isComplete: boolean;
}

export default function DashboardClient({ user }: SessionData) {
    const [value, setValue] = useState("");
    const [error, setError] = useState("エラーが発生しました");
    const [incompleteTodos, setIncompleteTodos] = useState<Todo[]>([]);
    const [completeTodos, setCompleteTodos] = useState<Todo[]>([]);

    //入力欄
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }

    //追加ボタン
    const handleAddTodo = async () => {
        console.log("追加ボタンが押されました！");
        console.log("入力値:", value);

        if (value.trim() === "") {
            console.log("空の入力は追加できません");
            return;
        }

        // 新しいTodoオブジェクトを作成
        const newTodo: Todo = {
            userId: user?.userId || "",
            taskId: new Date().toISOString(), // ISO 8601形式でtaskIdを生成
            Task: value,
            isComplete: false
        };

        //dynamoDBに追加
        const res = await callApi("/api/todo/add-todo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ Todo: newTodo }),
        })

        // incompleteTodosに新しいTodoを追加
        setIncompleteTodos([...incompleteTodos, newTodo]);
        setValue(""); // 入力欄をクリア
    }

    //移動する関数
    const handleToggleComplete = async (indexTomove: number, isComplete: boolean) => {

        const todo = isComplete ? completeTodos[indexTomove] : incompleteTodos[indexTomove]
        //callApiでdynamoDBのisCompleteを反転する
        const res = await callApi("/api/todo/toggle-complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                userId: todo.userId,
                taskId: todo.taskId,
                isComplete: todo.isComplete
            }),
        })

        if (!isComplete) {
            // 未完了 → 完了済みに移動
            const itemToMove = incompleteTodos[indexTomove];
            const newIncomplete = incompleteTodos.filter((_, i) => i !== indexTomove);
            setIncompleteTodos(newIncomplete);
            setCompleteTodos([...completeTodos, { ...itemToMove, isComplete: true }]);
        } else {
            // 完了済み → 未完了に移動
            const itemToMove = completeTodos[indexTomove];
            const newComplete = completeTodos.filter((_, i) => i !== indexTomove);
            setCompleteTodos(newComplete);
            setIncompleteTodos([...incompleteTodos, { ...itemToMove, isComplete: false }]);
        }
    }

    //TODOを削除
    const handleDeleteTodo = async (indexTomove: number, isComplete: boolean) => {
        const todo = isComplete ? completeTodos[indexTomove] : incompleteTodos[indexTomove]
        //callApiでdynamoDBのisCompleteを反転する
        const res = await callApi("/api/todo/delete-todo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                userId: todo.userId,
                taskId: todo.taskId,
            }),
        })
        if (!isComplete) {
            // 未完了 → 完了済みに移動
            const newIncomplete = incompleteTodos.filter((_, i) => i !== indexTomove);
            setIncompleteTodos(newIncomplete);
        } else {
            // 完了済み → 未完了に移動
            const newComplete = completeTodos.filter((_, i) => i !== indexTomove);
            setCompleteTodos(newComplete);
        }
    }

    const fetchTodos = async () => {
        try {
            console.log("api実行");
            const data = await callApi("/api/todo/get-todos", {
                method: "GET",
                credentials: "include", // セッションクッキーを送信
            });
            console.log("APIレスポンス:", data);
            console.log(data.incompleteTodos);
            console.log(data.completeTodos)
            setIncompleteTodos(data.incompleteTodos || []);
            setCompleteTodos(data.completeTodos || []);
        } catch (error) {
            console.error("データの取得に失敗しました", error);
            setError("タスクの取得に失敗しました");
        }
    };

    console.log("************************");
    useEffect(() => {
        fetchTodos();
    }, []);

    if (!user) {
        return <p>ログイン情報が取得できませんでした。</p>;
    }


    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome, {user.email}</h1>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">リストの追加</h2>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            value={value}
                            onChange={handleChange}
                            placeholder="新しいタスクを入力..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            onClick={handleAddTodo}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            追加
                        </button>
                    </div>
                    {value && (
                        <p className="mt-3 text-sm text-gray-600">入力内容: {value}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                            未完了
                        </h2>
                        <ul className="space-y-3">
                            {incompleteTodos.map((todo, index) => (
                                <li key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="text-gray-900 flex-1">
                                            {todo.Task}
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <button
                                                onClick={() => handleToggleComplete(index, false)}
                                                className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm">
                                                完了済みに移動
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTodo(index, false)}
                                                className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm">
                                                削除
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                            完了済み
                        </h2>
                        <ul className="space-y-3">
                            {completeTodos.map((todo, index) => (
                                <li key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="text-gray-700 flex-1 line-through">
                                            {todo.Task}
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <button
                                                onClick={() => handleToggleComplete(index, true)}
                                                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors text-sm">
                                                未完了に移動
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTodo(index, true)}
                                                className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm">
                                                削除
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}