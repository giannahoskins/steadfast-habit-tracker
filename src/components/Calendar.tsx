import type { Habit } from "../types"
import React, { useState, useRef } from "react"
import { IconArrowNarrowLeft, IconArrowNarrowRight, IconTrash, IconEdit, IconSparkles, IconPlus, IconChartBarPopular } from '@tabler/icons-react';
import * as Tone from "tone"
import { motion, AnimatePresence } from "motion/react"
import { calculateStreak } from "../utils.ts"

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

async function playCompletionSound() {
    await Tone.start()
    const synth = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: {
            attack: 0.01,
            decay: 0.1,
            sustain: 0.3,
            release: 0.5
        }
    }).toDestination()

    const now = Tone.now()
    synth.triggerAttackRelease("E5", "8n", now)
    synth.triggerAttackRelease("G5", "8n", now + 0.12)
}

async function playMilestoneSound() {
    await Tone.start()
    const synth = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: {
            attack: 0.01,
            decay: 0.1,
            sustain: 0.3,
            release: 0.8
        }
    }).toDestination()

    const now = Tone.now()
    synth.triggerAttackRelease("E5", "8n", now)
    synth.triggerAttackRelease("G5", "8n", now + 0.15)
    synth.triggerAttackRelease("C6", "4n", now + 0.3)
}

function Calendar({ habits, onDeleteHabit, onCompleteHabit, isAddingHabit, setIsAddingHabit, onAddHabit, onSaveEdit, setShowStats, setIsModalOpen }: CalendarProps) {
    const [newHabitName, setNewHabitName] = useState('')
    const [editingHabitId, setEditingHabitId] = useState<string | null>(null)
    const [editHabitName, setEditHabitName] = useState('')
    const [hoveredHabitId, setHoveredHabitId] = useState<string | null>(null)
    const [animatingCell, setAnimatingCell] = useState<string | null>(null)
    const [milestone, setMilestone] = useState<number | null>(null)
    const [swipedHabitId, setSwipedHabitId] = useState<string | null>(null)
    const touchStartX = useRef<number>(0)

    const [currentDate, setCurrentDate] = useState(() => {
        const today = new Date()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        return startOfWeek
    })

    const [selectedDay, setSelectedDay] = useState(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return today
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
            
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto w-full">
                <div id="habit_grid" className="grid border border-border rounded" style={{ gridTemplateColumns: `250px repeat(7, 1fr)`, minWidth: '640px' }}>
                    <div className="border-r border-b border-surface bg-surface-raised flex items-center p-7.5 text-days uppercase font-semibold"><span>Habits</span></div>
                    {days.map(day => 
                        <div className="day flex flex-col items-center justify-center border-b border-surface cursor-pointer" key={day.getDate()} onClick={() => setSelectedDay(day)} style={{ backgroundColor: day.toDateString() === selectedDay.toDateString() ? 'rgba(108,92,231,0.12)' : 'var(--color-surface-raised)' }}>
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
                                        <div className={`habit-cell flex items-center justify-center border-b border-border min-h-20 ${new Date(date) > todaysDate ? 'opacity-30' : ''}`} key={day.getDate()} style={day.toDateString() === selectedDay.toDateString() ? { backgroundColor: 'rgba(108,92,231,0.05)' } : {}}
                                            onClick={() => {
                                                if (new Date(date) <= todaysDate) {
                                                    if (!habit.completedDates.includes(date)) {
                                                        setAnimatingCell(`${habit.id}-${date}`)
                                                        setTimeout(() => setAnimatingCell(null), 600)

                                                        const newStreak = calculateStreak([...habit.completedDates, date])
                                                        if ([3, 7, 14, 30, 60, 100].includes(newStreak)) {
                                                            setMilestone(newStreak)
                                                            playMilestoneSound()
                                                            setTimeout(() => setMilestone(null), 3000)
                                                        } else {
                                                            playCompletionSound()
                                                        }
                                                    }

                                                    onCompleteHabit(habit.id, date)
                                                }
                                            }}>
                                            {habit.completedDates.includes(date) ? 
                                                <motion.div 
                                                    style={{ backgroundColor: habit.color }} 
                                                    className="w-11 h-11 rounded cursor-pointer flex items-center justify-center"
                                                    animate={animatingCell === `${habit.id}-${date}` ? { scale: [1, 1.2, 1] } : {}}
                                                    transition={{ duration: 0.4 }}
                                                >
                                                    {animatingCell === `${habit.id}-${date}` && (
                                                        <motion.span
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: [0, 1, 0] }}
                                                            transition={{ duration: 0.5 }}
                                                            className="text-white text-sm font-bold"
                                                        >
                                                            ✓
                                                        </motion.span>
                                                    )}
                                                </motion.div> 
                                                : 
                                                <div className="w-[50px] h-[50px] border border-border rounded bg-surface-raised cursor-pointer"></div>
                                            }
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

            {/* Mobile view */}
            <div className="md:hidden">
                {/* Week pill tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {days.map(day => {
                        const isSelected = day.toDateString() === selectedDay.toDateString()
                        const isToday = day.toDateString() === new Date().toDateString()
                        return (
                            <button
                                key={day.getDate()}
                                onClick={() => setSelectedDay(day)}
                                className={`flex flex-col items-center px-3 py-2 rounded-lg shrink-0 border transition duration-200
                                    ${isSelected 
                                        ? 'bg-accent/15 border-accent/40' 
                                        : 'border-transparent'
                                    }`}
                            >
                                <span className={`text-xs uppercase tracking-wider ${isSelected ? 'text-accent' : 'text-days'}`}>
                                    {day.toLocaleString('default', { weekday: 'short' })}
                                </span>
                                <span className={`text-sm font-bold ${isSelected || isToday ? 'text-accent' : 'text-dates'}`}>
                                    {day.getDate()}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* Habit checklist for selected day */}
                <div className="flex flex-col gap-2">
                    {habits.map(habit => {
                        const date = `${selectedDay.getFullYear()}-${selectedDay.getMonth() + 1}-${selectedDay.getDate()}`
                        const isCompleted = habit.completedDates.includes(date)
                        const isFuture = selectedDay > todaysDate
                        return (
                            <div
                                key={habit.id}
                                onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
                                onTouchEnd={(e) => {
                                    const diff = touchStartX.current - e.changedTouches[0].clientX
                                    if (diff > 60) setSwipedHabitId(habit.id)
                                    else if (diff < -20) setSwipedHabitId(null)
                                }}
                                className="relative overflow-hidden rounded-lg"
                            >
                                {swipedHabitId === habit.id && (
                                    <button 
                                        className="absolute right-0 top-0 bottom-0 bg-red-500 px-5 text-white text-sm font-medium z-10"
                                        onClick={() => {
                                            onDeleteHabit(habit.id)
                                            setSwipedHabitId(null)
                                        }}
                                    >
                                        Delete
                                    </button>
                                )}
                                <div
                                    onClick={() => { 
                                        if (!isFuture) {
                                            if (!isCompleted) {
                                                playCompletionSound()
                                                const newStreak = calculateStreak([...habit.completedDates, date])
                                                if ([3, 7, 14, 30, 60, 100].includes(newStreak)) {
                                                    setMilestone(newStreak)
                                                    setTimeout(() => playMilestoneSound(), 400)
                                                    setTimeout(() => setMilestone(null), 3000)
                                                }
                                            }
                                            onCompleteHabit(habit.id, date)
                                        }    
                                    }}
                                    className={`flex items-center gap-3 p-4 border transition duration-200 cursor-pointer
                                        ${isFuture ? 'opacity-30' : ''}
                                        ${isCompleted ? 'border-transparent' : 'border-border bg-surface-raised'}`}
                                    style={isCompleted ? { backgroundColor: `${habit.color}15`, borderColor: `${habit.color}40` } : {}}
                                >
                                    <div
                                        className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: isCompleted ? habit.color : 'transparent', border: isCompleted ? 'none' : `1.5px solid #3a3a52` }}
                                    >
                                        {isCompleted && <span className="text-white text-xs font-bold">✓</span>}
                                    </div>
                                    <span className="text-sm font-medium" style={{ color: habit.color }}>{habit.name}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Add habit field */}
                {isAddingHabit && (
                    <div className="flex gap-2 mt-2">
                        <input
                            autoFocus
                            className="flex-1 border border-border rounded px-3 py-2"
                            placeholder="Habit name..."
                            value={newHabitName}
                            onChange={(e) => setNewHabitName(e.target.value)}
                            onBlur={() => {
                                setTimeout(() => setIsAddingHabit(false), 150)
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') addNewHabit()
                            }}
                        />
                        <button 
                            className="purple-button !px-3"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={addNewHabit}
                        >
                            <IconPlus size={16} />
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                    <button className="flex items-center text-dates" onClick={() => setIsAddingHabit(true)}>
                        <IconPlus size={16} /><span className="ml-2 text-sm">Add habit</span>
                    </button>
                    <button className="flex items-center text-accent" onClick={() => setIsModalOpen(true)}>
                        <IconSparkles size={16} /><span className="ml-2 text-sm">AI suggest</span>
                    </button>
                </div>
            </div>
            <AnimatePresence>
                {milestone && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="text-center"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: "spring", damping: 10, stiffness: 200 }}
                        >
                            <div className="text-8xl mb-4">🔥</div>
                            <div className="text-5xl font-bold text-white">{milestone} Day Streak!</div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )

}

export default Calendar