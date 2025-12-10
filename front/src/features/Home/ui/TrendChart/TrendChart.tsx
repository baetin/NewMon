import { BarChart, Bar, XAxis, YAxis } from "recharts";
import { TrendChartContainer } from "@/features/home/ui/TrendChart/TrendChart.styles";

const data = [
  { name: "경제", count: 24 },
  { name: "사회", count: 18 },
  { name: "IT/과학", count: 32 },
  { name: "스포츠", count: 15 },
];

export const TrendChart = () => {
  return (
    <TrendChartContainer>
      <h3>Today's Articles by Category</h3>
      <BarChart
        style={{
          width: "100%",
          height: "200px",
          maxWidth: "250px",
          maxHeight: "100%",
          fontSize: "0.8rem",
          aspectRatio: 1.618,
        }}
        responsive
        data={data}
      >
        <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
        <YAxis />
        <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
      </BarChart>
      <p>갱신시간 기준</p>
    </TrendChartContainer>
  );
};
