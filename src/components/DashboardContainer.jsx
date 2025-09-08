import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery } from "react-query";
import { saveSalesData, getAllSalesData } from "../utils/indexedDB.js";
import { useSharedLayout } from "./useSharedLayout";

let counter = 0;

const fetchSalesData = async () => {
  if (counter === 0) {
    counter++;
    const data = [];
    for (let i = 1; i <= 120; i++) {
      data.push({
        id: i.toString(),
        category: `Category ${i}`,
        revenue: 10000 + i * 100,
        cogs: 5000 + i * 50,
      });
    }
    return data;
  }
  return [];
};

const KpiCard = ({ id, category, revenue, cogs }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className="cursor-grab rounded-lg bg-white border border-gray-200 p-6 shadow-md transform transition duration-200 hover:shadow-xl hover:-translate-y-1"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
    >
      <h3 className="mb-4 text-xl font-semibold text-gray-900">{category}</h3>
      <div className="space-y-2 text-gray-700">
        <div className="flex justify-between">
          <span className="font-medium">Revenue:</span>
          <span className="text-green-600 font-semibold">
            ${revenue.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">COGS:</span>
          <span className="text-red-600 font-semibold">
            ${cogs.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between border-t pt-2 mt-2 font-semibold text-gray-800">
          <span>Profit:</span>
          <span>${(revenue - cogs).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

const DashboardContainer = () => {
  const {
    data: salesData,
    isLoading,
    error,
  } = useQuery("salesData", fetchSalesData, {
    refetchInterval: 60000,
    onSuccess: async (data) => {
      await saveSalesData(data);
    },
  });

  const [items, setItems] = useState([]);
  const [offlineData, setOfflineData] = useState(null);
  const [sharedLayout, setSharedLayout] = useSharedLayout();

  useEffect(() => {
    if (salesData && Array.isArray(salesData) && salesData.length > 0) {
      setItems(salesData.map((item) => item.id));
      setOfflineData(null);
    }
  }, [salesData]);

  useEffect(() => {
    async function loadOfflineData() {
      try {
        const offline = await getAllSalesData();
        if (
          (!salesData || !Array.isArray(salesData) || salesData.length === 0) &&
          Array.isArray(offline)
        ) {
          setOfflineData(offline);
          setItems(offline.map((item) => item.id));
        }
      } catch (e) {
        console.error("Failed to load offline data", e);
      }
    }
    loadOfflineData();
  }, [salesData]);

  useEffect(() => {
    if (
      salesData &&
      Array.isArray(salesData) &&
      salesData.length > 0 &&
      sharedLayout &&
      Array.isArray(sharedLayout) &&
      sharedLayout.length > 0
    ) {
      const filteredIds = sharedLayout.filter((id) =>
        salesData.some((d) => d.id === id)
      );
      setItems(filteredIds);
    } else if (salesData && Array.isArray(salesData) && salesData.length > 0) {
      setItems(salesData.map((item) => item.id));
    }
  }, [sharedLayout, salesData]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.indexOf(active.id);
        const newIndex = currentItems.indexOf(over.id);
        const newOrder = arrayMove(currentItems, oldIndex, newIndex);
        setSharedLayout(newOrder);
        return newOrder;
      });
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96 text-gray-500">
        Loading sales data...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-96 text-red-500">
        Error loading data
      </div>
    );

  const listData =
    salesData && Array.isArray(salesData) && salesData.length > 0
      ? salesData
      : offlineData && Array.isArray(offlineData) && offlineData.length > 0
      ? offlineData
      : [];

  const orderedData =
    listData.length > 0
      ? items.map((id) => listData.find((s) => s.id === id)).filter(Boolean)
      : [];

  return (
    <div className="max-w-7xl mx-auto p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-xl border border-gray-200 shadow-lg min-h-[80vh]">
      <h2 className="mb-8 text-4xl font-extrabold text-white select-none">
        Sales Analytics Dashboard
      </h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            style={{ minHeight: "60vh" }}
          >
            {orderedData.length > 0 ? (
              orderedData.map(({ id, category, revenue, cogs }) => (
                <KpiCard
                  key={id}
                  id={id}
                  category={category}
                  revenue={revenue}
                  cogs={cogs}
                />
              ))
            ) : (
              <p className="text-center col-span-full text-gray-500">
                No data available
              </p>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default DashboardContainer;
