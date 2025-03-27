
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { ValueChainData } from "@/types/valueChain";
import { toast } from "sonner";
import { valueChainService } from "@/services/value-chain";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";

export function useValueChainResults() {
  const location = useLocation();
  const { company } = useCompanyProfile();
  const [valueChainData, setValueChainData] = useState<ValueChainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"view" | "create">("view");
  const [dataChanged, setDataChanged] = useState(false);

  useEffect(() => {
    console.log("ValueChainResults: Component mounted");
    
    const loadData = async () => {
      setLoading(true);
      
      // First try to get valueChainData from location state
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
      } else if (company) {
        console.log("ValueChainResults: No data in location state, trying to load from database");
        
        try {
          // Try to load from database first
          const dbData = await valueChainService.loadValueChain(company.id);
          
          if (dbData) {
            console.log("ValueChainResults: Data loaded from database", dbData);
            setValueChainData(dbData);
          } else {
            console.log("ValueChainResults: No data in database, checking localStorage");
            
            // If no data in database, try localStorage
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
          }
        } catch (error) {
          console.error("Error loading value chain from database:", error);
          toast.error("Error loading value chain data");
          setActiveTab("create");
        }
      } else {
        console.log("ValueChainResults: No company available, checking localStorage");
        
        // If no company, try localStorage as last resort
        try {
          const savedData = localStorage.getItem('lastGeneratedValueChain');
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            console.log("ValueChainResults: Data loaded from localStorage", parsedData);
            setValueChainData(parsedData);
          } else {
            console.log("ValueChainResults: No data found in localStorage either");
            setActiveTab("create");
          }
        } catch (error) {
          console.error("Error parsing saved value chain data:", error);
          toast.error("Error loading saved value chain data");
          setActiveTab("create");
        }
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [location.state, company]);

  const handleValueChainLoad = useCallback((valueChain: ValueChainData) => {
    setValueChainData(valueChain);
    setActiveTab("view");
    setDataChanged(false);
  }, []);

  const handleValueChainChange = useCallback((newData: ValueChainData) => {
    setValueChainData(newData);
    setDataChanged(true);
  }, []);

  return {
    valueChainData,
    setValueChainData: handleValueChainLoad,
    handleValueChainChange,
    loading,
    activeTab,
    setActiveTab,
    dataChanged
  };
}
