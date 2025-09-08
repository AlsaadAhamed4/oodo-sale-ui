import React from "react";
import DashboardContainer from "./components/DashboardContainer";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContainer />
    </QueryClientProvider>
  );
};

export default App;
