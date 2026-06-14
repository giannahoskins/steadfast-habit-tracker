import type { Habit } from "../types"
import { useState } from "react"
import { IconX, IconPlus, IconSparkles, IconLoader2 } from '@tabler/icons-react'

interface ModalProps {
    habits: Habit[],
    isOpen: boolean
    onClose: () => void
    onAddHabit: (name: string) => void
}

function HabitSuggestionModal({isOpen, onClose, onAddHabit}: ModalProps) {
    const [input, setInput] = useState('')
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)

    async function getSuggestions() {
        setIsLoading(true)
        try {
            const response = await fetch("/.netlify/functions/claude", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
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
            console.log(data)
            const text = data.content[0].text.replace(/```json\n?|\n?```/g, '').trim()
            const parsed = JSON.parse(text)
            setSuggestions(parsed)
        } finally {
            setIsLoading(false)
        }
    }

    function handleAddSuggestion(suggestion: string) {
        onAddHabit(suggestion)
        setSuggestions(suggestions.filter(s => s !== suggestion))
    }

    return (
        <>
            {isOpen && (
                <>
                    <div className="fixed inset-0 bg-black/50" onClick={onClose} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface p-8 md:p-11 rounded-xl z-10 min-w-[90%] sm:min-w-[500px]">
                        <h2 className="header-text mb-8">What are you working toward?</h2>
                        <p className="body-text mb-8">Tell us your goal and we'll suggest habits to help you get there.</p>
                        {suggestions.length > 0 && (
                            <div className="suggestions-container mb-10">
                                {suggestions.map(suggestion => (
                                    <div className="habit-suggestion grid grid-cols-[1fr_auto] my-3 items-center" key={suggestion}>
                                        <p className="body-text text-text!">{suggestion}</p>
                                        <button className="purple-button max-w-[75px] ml-5" onClick={() => handleAddSuggestion(suggestion)}><IconPlus className="mx-auto" /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="w-[100%] flex flex-nowrap items-center justify-end gap-3 items-center">
                            <input value={input} className="border border-subtle rounded px-3 py-2 flex-1 w-full" placeholder="e.g. I want to get healthier, sleep better, etc." onChange={(e) => setInput(e.target.value)}></input>
                            <button onClick={() => getSuggestions()} className="purple-button !p-3 flex items-center md:my-0" disabled={isLoading}>
                                <span className="flex items-center relative z-10">
                                    {isLoading ? <IconLoader2 size={16} className="animate-spin" /> : <IconSparkles size={16} />}
                                </span>
                            </button>
                        </div>
                        <button onClick={onClose} className="absolute top-2.5 right-2.5 shrink-0"><IconX stroke={1} className="w-6"/></button>
                    </div>
                </>
            )}
        </>
    )
}

export default HabitSuggestionModal