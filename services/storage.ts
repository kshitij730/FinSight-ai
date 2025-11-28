
import { SavedReport, ComparisonResult } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Simulation of a Backend Database using LocalStorage
// In Phase 2, this would be replaced by Supabase/Firebase calls

const STORAGE_KEY = 'finsight_reports';

export const saveReport = (title: string, result: ComparisonResult, fileNames: string[]): SavedReport => {
  const newReport: SavedReport = {
    id: uuidv4(),
    title: title || `Analysis - ${new Date().toLocaleDateString()}`,
    date: new Date().toISOString(),
    result,
    fileNames
  };

  const existingData = localStorage.getItem(STORAGE_KEY);
  const reports: SavedReport[] = existingData ? JSON.parse(existingData) : [];
  
  // Add to beginning
  reports.unshift(newReport);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  return newReport;
};

export const getReports = (): SavedReport[] => {
  const existingData = localStorage.getItem(STORAGE_KEY);
  return existingData ? JSON.parse(existingData) : [];
};

export const deleteReport = (id: string): void => {
  const reports = getReports();
  const filtered = reports.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const getReportById = (id: string): SavedReport | undefined => {
  const reports = getReports();
  return reports.find(r => r.id === id);
};
