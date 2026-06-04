import type { Habit } from "./types"
import { useState, useEffect } from "react"
import Calendar from "./components/Calendar"
import HabitSuggestionModal from "./components/HabitSuggestionModal"

function App() {
  const [isAddingHabit, setIsAddingHabit] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('myHabits') ?? '[]')
    } catch {
      return []
    }
  })

  function handleAddHabit(habitName: string) {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: habitName,
      completedDates: []
    }

    setHabits([...habits, newHabit])
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
    <div className="bg-background min-h-screen text-text">
      <h1>Habit Tracker</h1>
      {habits.length === 0 && !isAddingHabit ? (
        <div>
          <p>No habits have been added yet. Click '+' to add a habit</p>
          <button onClick={() => setIsAddingHabit(true)}>+</button>
        </div>
      ) : (
        <Calendar habits={habits} onDeleteHabit={handleDeleteHabit} onCompleteHabit={handleCompleteHabit} onAddHabit={handleAddHabit} isAddingHabit={isAddingHabit} setIsAddingHabit={setIsAddingHabit} onSaveEdit={handleSaveEdit}/>
      )}
      <button onClick={() => setIsModalOpen(true)}>Open Modal</button>
      {isModalOpen === true &&
        <>
          <HabitSuggestionModal isOpen={true} />
          <button onClick={() => setIsModalOpen(false)}>Close Modal</button>
        </>
      }
    </div>
  )
}

export default App