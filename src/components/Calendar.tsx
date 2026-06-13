import type { Habit } from "../types"
import React, { useState } from "react"
import { IconArrowNarrowLeft, IconArrowNarrowRight, IconTrash, IconEdit, IconSparkles, IconPlus, IconChartBarPopular } from '@tabler/icons-react';

interface CalendarProps {
    habits: Habit[],
    onDeleteHabit: (id: string) => void
    onCompleteHabit: (id: string, date: string) => void
    isAddingHabit: boolean
    setIsAddingHabit: (value: boolean) => void
    onAddHabit: (name: string) => void
    onSaveEdit: (id: string, name: string) => void
    showStats: boolean
    setShowStats: (value: boolean) => void
    setIsModalOpen: (value: boolean) => void
}

function Calendar({ habits, onDeleteHabit, onCompleteHabit, isAddingHabit, setIsAddingHabit, onAddHabit, onSaveEdit, setShowStats, setIsModalOpen }: CalendarProps) {
    const [newHabitName, setNewHabitName] = useState('')
    const [editingHabitId, setEditingHabitId] = useState<string | null>(null)
    const [editHabitName, setEditHabitName] = useState('')
    const [hoveredHabitId, setHoveredHabitId] = useState<string | null>(null)

    const [currentDate, setCurrentDate] = useState(() => {
        const today = new Date()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        return startOfWeek
    })

    const days = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(currentDate)
        day.setDate(currentDate.getDate() + i)
        return day
    })

    function handlePrevWeek() {
        const prevWeek = new Date(currentDate)
        prevWeek.setDate(prevWeek.getDate() - 7)
        setCurrentDate(prevWeek)
    }

    function handleNextWeek() {
        const nextWeek = new Date(currentDate)
        nextWeek.setDate(nextWeek.getDate() + 7)
        setCurrentDate(nextWeek)
    }

    function addNewHabit() {
        onAddHabit(newHabitName)
        setNewHabitName('')
        setIsAddingHabit(false)
    }

    function handleStartEditing(id: string, name: string) {
        setEditingHabitId(id)
        setEditHabitName(name)
    }

    const currentYear = `${days[0].getFullYear()}`
    const dateRange = `${days[0].toLocaleString('default', { month: 'short', day: 'numeric' })} - ${days[6].toLocaleString('default', { month: 'short', day: 'numeric' })}`
    const todaysDate = new Date()
    todaysDate.setHours(0, 0, 0, 0)
    
    return (
        <div className="calendar-view pt-15">
            <div className="text-center">
                <span className="block text-subtle">{currentYear}</span>
            </div>
            <div id="week_header_container" className="flex justify-between max-w-200 items-center mx-auto my-5">
                <button className="navigation-button prev" onClick={handlePrevWeek}><IconArrowNarrowLeft stroke={2} /></button>
                <h2 id="week" className="text-2xl xl:text-4.5xl lg:text-4xl md:text-3xl purple-gradient font-bold">{dateRange}</h2>
                <button className="navigation-button next" onClick={handleNextWeek}><IconArrowNarrowRight stroke={2} /></button>
            </div>
            <button onClick={() => setShowStats(true)} className="purple-button mx-auto my-6 flex items-center z-0"><IconChartBarPopular className="mr-2.5"/><span className="block">Stats</span></button>
            <div className="overflow-x-auto w-full">
                <div id="habit_grid" className="grid border border-border rounded" style={{ gridTemplateColumns: `250px repeat(7, 1fr)`, minWidth: '640px' }}>
                    <div className="border-r border-b border-surface bg-surface-raised flex items-center p-7.5 text-days uppercase font-semibold"><span>Habits</span></div>
                    {days.map(day => 
                        <div className="day flex flex-col items-center justify-center border-b border-surface bg-surface-raised" key={day.getDate()}>
                            <span className="block text-dates font-bold">{day.toLocaleString('default', { month: 'numeric', day: 'numeric'} )}</span>
                            <span className="block uppercase text-days font-semibold">{day.toLocaleString('default', { weekday: 'short' })}</span>
                        </div>
                    )}
                    {habits.map(habit => {
                        

                        return (
                            <React.Fragment key={habit.id}>
                                <div style={{ color: habit.color }} className="habit-grid-name w-full border-b border-border flex items-center pl-3 pr-16 relative" onMouseEnter={() => setHoveredHabitId(habit.id)} onMouseLeave={() => setHoveredHabitId(null)}>
                                    <div style={{ backgroundColor: habit.color }} className="w-1.5 h-10 rounded mr-2.5"></div>
                                    {editingHabitId === habit.id ?
                                        <input 
                                            autoFocus 
                                            className="w-full h-full wrap-break-word"
                                            value={editHabitName} 
                                            onChange={(e) => setEditHabitName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    onSaveEdit(habit.id, editHabitName)
                                                    setEditingHabitId(null)
                                                }
                                            }}
                                            onBlur={() => setEditingHabitId(null)}
                                        />
                                        : habit.name
                                    }
                                    {hoveredHabitId === habit.id && 
                                        <div id="habit_button_container" className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                            <button onClick={() => onDeleteHabit(habit.id)}><IconTrash stroke={2} /></button> 
                                            <button onClick={() => handleStartEditing(habit.id, habit.name)}><IconEdit stroke={2} /></button>
                                        </div>
                                    }
                                </div>
                                {days.map(day => {
                                    const date = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`
                                    return (
                                        <div className={`habit-cell flex items-center justify-center border-b border-border min-h-20 ${new Date(date) > todaysDate ? 'opacity-30' : ''}`} key={day.getDate()} onClick={() => { if (new Date(date) <= todaysDate) onCompleteHabit(habit.id, date)}}>
                                            {habit.completedDates.includes(date) ? <div style={{ backgroundColor: habit.color }} className="w-11 h-11 rounded cursor-pointer"></div> : <div className="w-[50px] h-[50px] border border-border rounded bg-surface-raised cursor-pointer"></div>}
                                        </div>
                                    )
                                })}
                            </React.Fragment>
                        )
                    })}
                    {isAddingHabit ?
                        <React.Fragment>
                            <input autoFocus className="w-full border-b border-border min-h-12" value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)}  onBlur={() => setIsAddingHabit(false)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') addNewHabit()
                                }}></input>
                                {days.map(day => (
                                    <div className="habit-cell border-b border-border min-h-12" key={day.getDate()}></div>
                                ))}
                        </React.Fragment>
                        : null}
                    <div className="chart-footer flex bg-surface-raised col-span-full p-7.5">
                        <button className="flex items-center whitespace-nowrap" onClick={() => {setIsAddingHabit(true)}}><IconPlus size={16} className="text-dates"/><span className="ml-2.5 font-medium text-dates">Add habit</span></button>
                        <button className="flex items-center  text-accent pl-6 whitespace-nowrap" onClick={() => setIsModalOpen(true)}><IconSparkles size={16} /><span className="ml-2.5 font-medium">AI suggest</span></button>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default Calendar