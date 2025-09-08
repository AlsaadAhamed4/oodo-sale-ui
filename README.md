Sales Analytics Dashboard
A modern, real-time dashboard for sales analytics, built in React and styled with Tailwind CSS. The dashboard supports live KPI updates, drag-and-drop customization, offline usage, and high performance even for large data sets.

Features
Live Sales Data: Displays revenue and COGS per product category, updating automatically when sales orders are confirmed or delivered.

Drag-and-Drop Customization: Rearrange KPI cards with a smooth drag-and-drop interface powered by @dnd-kit.

Offline Support: Uses IndexedDB to cache sales data locally. Works seamlessly even without an internet connection.

High Performance: Renders efficiently with support for 100+ product categories using grid layout and fast UI updates.

Collaboration Ready: Optionally syncs card layout across sessions with Yjs (requires backend setup).

Beautiful UI: Responsive, accessible, and visually appealing, thanks to Tailwind CSS.

Installation
Clone the repository

bash
git clone https://github.com/yourusername/sales-dashboard.git
cd sales-dashboard
Install dependencies

bash
npm install
Set up Tailwind CSS

Ensure these lines are at the top of your src/index.css:

css
@tailwind base;
@tailwind components;
@tailwind utilities;
Your tailwind.config.js should include:

js
module.exports = {
content: ["./src/**/*.{js,jsx,ts,tsx}"],
theme: { extend: {} },
plugins: [],
};
Start the development server

bash
npm start
Usage
Dashboard UI: The main dashboard view loads and displays KPI cards for each product category.

Drag-and-Drop: Click/tap and drag any KPI card to rearrange cards to your preference.

Offline Mode: Disconnect from the network and interact with previously cached data without interruption.

Customization and Advanced Setup
Data Source: Replace the mock fetchSalesData function in DashboardContainer.jsx with your real Odoo RPC/API integration for production use.

Collaboration: Integrate the Yjs backend for real-time collaborative editing of KPI card layouts.

Styling: Tailwind CSS classes are used throughout; customize your theme in tailwind.config.js as desired.

Performance: For extremely large data sets, hybrid virtualization libraries can be introduced.

Project Structure
text
src/
components/
DashboardContainer.jsx
KpiCard.jsx
useSharedLayout.js
utils/
indexedDB.js
index.css
App.jsx
tailwind.config.js
Dependencies
React (UI library)

Tailwind CSS (utility-first CSS framework)

@dnd-kit/core (drag-and-drop library)

react-query (data fetching and state management)

react-virtualized (optional, for virtualization)

idb (IndexedDB wrapper)

Yjs and y-websocket (optional, for sync)

License
MIT

Author
Alsaad
AlsaadAhamed4
