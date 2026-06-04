import type { Habit } from "../types"
import React, { useState } from "react"

interface ModalProps {
    habits: Habit[],
    isOpen: boolean
    onClose: () => void
    onAddHabit: (name: string) => void
}

function HabitSuggestionModal({habits, isOpen, onClose, onAddHabit}: ModalProps) {
    const [input, setInput] = useState('')
    const [suggestions, setSuggestions] = useState<string[]>([])

    async function getSuggestions() {
        const response = await fetch("/api/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "anthropic-dangerous-direct-browser-access": "true"
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-5",
                max_tokens: 1000,
                messages: [
                    { role: "user",
                        content: `The user wants to achieve the following goal: ${input}. 
                        Suggest 5 specific habits they could track daily to help reach that goal. 
                        Return only a JSON array of habit names, nothing else.`
                    }
                ]
            })
        })

        const data = await response.json()
        const text = data.content[0].text.replace(/```json\n?|\n?```/g, '').trim()
        const parsed = JSON.parse(text)
        setSuggestions(parsed)
    }

    return (
        <>
            {isOpen && (
                <>
                    <input value={input} onChange={(e) => setInput(e.target.value)}></input>
                    <button onClick={() => getSuggestions()}>Submit</button>
                    {suggestions.map(suggestion => {
                        return (
                            <p key={suggestion}>{suggestion}</p>
                        )
                    })}
                </>
            )}
        </>
    )
}

export default HabitSuggestionModal