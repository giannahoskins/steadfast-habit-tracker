import type { Habit } from "./types"
import { useState, useEffect } from "react"
import Calendar from "./components/Calendar"
import HabitSuggestionModal from "./components/HabitSuggestionModal"
import HabitChart from "./components/HabitChart"
import { IconPlus, IconSparkles, IconX } from '@tabler/icons-react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [isAddingHabit, setIsAddingHabit] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const habitColors = [
    '#a99af9',
    '#f7926a', 
    '#6af7c8',
    '#f76a8e',
    '#f7d96a',
    '#6aaff7'
  ]

  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('myHabits') ?? '[]')
    } catch {
      return []
    }
  })

  function handleAddHabit(habitName: string) {
    setHabits(prev => {
        const newHabit: Habit = {
            id: crypto.randomUUID(),
            name: habitName,
            completedDates: [],
            createdOn: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`,
            color: habitColors[prev.length % habitColors.length]
        }
        return [...prev, newHabit]
    })
  }

  function handleDeleteHabit(id: string) {
    setHabits(habits.filter(habit => habit.id !== id))
  }

  function handleCompleteHabit(id: string, date: string) {
    setHabits(habits.map(habit => habit.id === id
      ? { ...habit, completedDates: habit.completedDates.includes(date) ? habit.completedDates.filter(d => d !== date) : [...habit.completedDates, date] }
      : habit))
  }

  function handleSaveEdit(id: string, name: string) {
    setHabits(habits.map(habit => habit.id === id ? {...habit, name: name} : habit))
  }

  useEffect(() => {
    localStorage.setItem('myHabits', JSON.stringify(habits))
  }, [habits])

  return (
    <div className="min-h-screen max-w-[1200px] mx-auto px-[5vw]">
      {habits.length === 0 && !isAddingHabit && (
        <>
          <div className="absolute inset-0 [background-image:radial-gradient(circle,#ffffff10_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_40%,#111116_100%)] pointer-events-none" />
        </>
      )}
      {habits.length === 0 && !isAddingHabit ? (
        <>
          <h1 className="text-subtle uppercase tracking-[15px] text-[22px0] font-semibold pt-[6vw] pb-[4vw]">Steadfast</h1>
          <div className="no-habits flex justify-between relative">
            <div className="no-habits-text-container">
              <span className="text-subtle uppercase tracking-[3px]">Day 0</span>
              <h2 className="header-text max-w-75">Your <span className="purple-gradient">streak</span> starts here.</h2>
              <p className="body-text max-w-100 mt-5">Track the habits that move you forward. One day at a time.</p>
              <div className="flex mt-8">
                <button className="flex items-center purple-button mr-3" onClick={() => setIsAddingHabit(true)}><IconPlus size={16} /> <span className="ml-2.5 font-medium">Add habit</span></button>
                <button className="flex items-center  text-accent border border-surface px-6 py-2 rounded transition duration-200 hover:bg-surface hover:border-accent" onClick={() => setIsModalOpen(true)}><IconSparkles size={16} /><span className="ml-2.5 font-medium">AI suggest</span></button>
              </div>
            </div>
            <div className="ghost-habits-container hidden md:block">
              <div className="ghost-habit border-habit-1">
                <span className="font-medium">Morning Run</span>
                <span className="text-subtle">0 Day Streak</span>
              </div>
              <div className="ghost-habit border-habit-2 mr-10">
                <span className="font-medium">Drink water</span>
                <span className="text-subtle">0 Day Streak</span>
              </div>
              <div className="ghost-habit border-habit-3 mr-20">
                <span className="font-medium">Read 20 mins</span>
                <span className="text-subtle">0 Day Streak</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <Calendar habits={habits} onDeleteHabit={handleDeleteHabit} onCompleteHabit={handleCompleteHabit} onAddHabit={handleAddHabit} isAddingHabit={isAddingHabit} setIsAddingHabit={setIsAddingHabit} onSaveEdit={handleSaveEdit} setShowStats={setShowStats} showStats={showStats} setIsModalOpen={setIsModalOpen} />
      )}
      {isModalOpen === true &&
          <HabitSuggestionModal isOpen={true} onAddHabit={handleAddHabit} onClose={() => setIsModalOpen(false)} habits={habits} />
      }
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            style={{ position: 'fixed', right: 0, top: 0, height: '100vh', width: '100vw' }}
            className="bg-surface"
          >
            <h2 className="text-[44px] mx-2.5 my-7.5 text-center">Habit Stats</h2>
            <HabitChart habits={habits} />
            <button className="absolute top-5 right-5" onClick={() => setShowStats(false)}><IconX stroke={1} className="w-6"/></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App