import AddHabitForm from "./components/AddHabitForm"
import type {Habit} from "./types"
import {useState, useEffect} from "react"
import Calendar from "./components/Calendar"

function App() {
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
                        ? {...habit, completedDates: habit.completedDates.includes(date) ? habit.completedDates.filter(d => d !==date) : [...habit.completedDates, date]} 
                        : habit))
  }

  useEffect(() => {
    localStorage.setItem('myHabits', JSON.stringify(habits))
  }, [habits])

  return (
    <div className="bg-background min-h-screen text-text">
      <AddHabitForm onAddHabit={handleAddHabit}/>
      <Calendar habits={habits} onDeleteHabit={handleDeleteHabit} onCompleteHabit={handleCompleteHabit} />
    </div>
  )
}

export default App