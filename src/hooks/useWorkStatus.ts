import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useWorkStatus = (activityId: string) => {
  const [workStarted, setWorkStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkIfWorkStarted(activityId);
  }, [activityId]);

  const checkIfWorkStarted = async (activityId: string) => {
    try {
      const { data: taskData } = await supabase
        .from('task_mapping')
        .select('start_work_time')
        .eq('activity_id', activityId)
        .not('start_work_time', 'is', null)
        .maybeSingle();
      
      setWorkStarted(!!taskData?.start_work_time);
    } catch (error) {
      console.error('Error checking work status:', error);
      setWorkStarted(false);
    } finally {
      setIsLoading(false);
    }
  };

  return { workStarted, isLoading };
};