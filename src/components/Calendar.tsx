import type {Habit} from "../types"
import {useState} from "react"

interface CalendarProps {
    habits: Habit[],
    onDeleteHabit: (id: string) => void
    onCompleteHabit: (id: string, date: string) => void
}

function Calendar({habits, onDeleteHabit, onCompleteHabit}: CalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const days = Array.from({length: daysInMonth}, (_, i) => i + 1)

    function handlePrevMonth() {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    }

    function handleNextMonth() {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    }

    return (
        <>
            <div id="month_header_container" className="flex">
                <button className="navigation-button prev" onClick={handlePrevMonth}>←</button>
                <h2 id="month" className="font-display">{currentDate.toLocaleString('default', {month: 'long', year: 'numeric'})}</h2>
                <button className="navigation-button next" onClick={handleNextMonth}>→</button>
            </div>
            <div id="habit_grid">
                <div id="days_row" className="grid grid-cols-[auto_repeat(31,1fr)]">
                    {days.map(day => <div className="day" key={day}><span>{day}</span></div>)}
                </div>
                {habits.map(habit => (
                    <div key={habit.id} className="habit-row">
                        <div className="habit-grid-name">{habit.name}</div>
                        {days.map(day => {
                            const date = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`
                            return (
                                <div className="habit-cell" key={day} onClick={() => onCompleteHabit(habit.id, date)}>
                                    {habit.completedDates.includes(date) ? '✓' : ''}
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>
        </>
    )
    
}

export default Calendar