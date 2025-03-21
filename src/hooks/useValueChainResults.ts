
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { ValueChainData } from "@/types/valueChain";
import { toast } from "sonner";

export function useValueChainResults() {
  const location = useLocation();
  const [valueChainData, setValueChainData] = useState<ValueChainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"view" | "create">("view");

  useEffect(() => {
    console.log("ValueChainResults: Component mounted");
    
    // Get valueChainData from location state
    const stateData = location.state?.valueChainData;
    
    if (stateData) {
      console.log("ValueChainResults: Data found in location state", stateData);
      setValueChainData(stateData);
      // Also save to localStorage as a fallback
      try {
        localStorage.setItem('lastGeneratedValueChain', JSON.stringify(stateData));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
      setLoading(false);
    } else {
      console.log("ValueChainResults: No data in location state, checking localStorage");
      // Try to get from localStorage if not in navigation state
      try {
        const savedData = localStorage.getItem('lastGeneratedValueChain');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log("ValueChainResults: Data loaded from localStorage", parsedData);
          setValueChainData(parsedData);
        } else {
          console.log("ValueChainResults: No data found in localStorage either");
          // Still allow the user to create from scratch
          setActiveTab("create");
        }
      } catch (error) {
        console.error("Error parsing saved value chain data:", error);
        toast.error("Error loading saved value chain data");
        setActiveTab("create");
      }
      setLoading(false);
    }
  }, [location.state]);

  const handleValueChainLoad = useCallback((valueChain: ValueChainData) => {
    setValueChainData(valueChain);
    setActiveTab("view");
  }, []);

  return {
    valueChainData,
    setValueChainData: handleValueChainLoad,
    loading,
    activeTab,
    setActiveTab
  };
}
