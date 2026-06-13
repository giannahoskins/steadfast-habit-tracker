import { ResponsiveContainer, Bar, BarChart, Tooltip, XAxis, YAxis } from 'recharts';
import type { Habit } from "../types"

interface HabitChartProps {
    habits: Habit[]
}

export function HabitChart({habits}: HabitChartProps) {
    const data = habits.map((habit) => {
        const created = new Date(habit.createdOn)
        const today = new Date()
        const daysSinceCreated = Math.max(1, Math.floor((today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)))
        const validCompletions = habit.completedDates.filter(date => date >= habit.createdOn)
        const completionRate = Math.min(100, daysSinceCreated === 0 ? 0 : (validCompletions.length / daysSinceCreated) * 100)

        return { name: habit.name, completionRate, color: habit.color }
    })

    return (
        <ResponsiveContainer width="100%" height={650}>
            <BarChart width={800} height={500}  data={data} margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                <XAxis dataKey="name" label={{ position: 'insideBottomRight', value: 'Habits', offset: -10 }} />
                <YAxis label={{ position: 'center', textAnchor: 'middle', value: 'Completion Rate', angle: -90 }} />
                <Bar dataKey="completionRate" shape={(props: any) => {
                    const { x, y, width, height, index } = props
                    return <rect x={x} y={y} width={width} height={height} fill={data[index].color} rx={4} ry={4} />
                }} />
                <Tooltip />
            </BarChart>
        </ResponsiveContainer>
    )
}

export default HabitChart