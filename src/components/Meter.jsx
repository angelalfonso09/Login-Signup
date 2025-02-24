// import React, { useEffect, useState } from "react";
// import { RadialBarChart, RadialBar } from "recharts";
// import axios from "axios";
// import { io } from "socket.io-client";
 
// const socket = io("http://localhost:5000");
 
// const GaugeMeter = () => {
//   const [value, setValue] = useState(0);
 
//   useEffect(() => {
//     // Fetch initial value
//     axios.get("http://localhost:5000/data").then((response) => {
//       setValue(response.data.value);
//     });
 
//     // Listen for real-time updates
//     socket.on("updateData", (newData) => {
//       setValue(newData.value);
//     });
 
//     return () => socket.disconnect();
//   }, []);
 
//   const data = [{ name: "Progress", value, fill: "#6FCF97" }];
 
//   return (
//     <div className="flex flex-col items-center bg-[#131b42] p-6 rounded-xl w-64">
//       <RadialBarChart
//         width={200}
//         height={120}
//         cx={100}
//         cy={100}
//         innerRadius={60}
//         outerRadius={100}
//         startAngle={180}
//         endAngle={0}
//         data={data}
//       >
//         <RadialBar minAngle={15} background dataKey="value" cornerRadius={5} />
//       </RadialBarChart>
//       <p className="text-white text-3xl font-bold mt-[-20px]">{value}%</p>
//     </div>
//   );
// };
 
// export default GaugeMeter;