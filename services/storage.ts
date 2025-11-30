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

  try {
    const existingData = localStorage.getItem(STORAGE_KEY);
    const reports: SavedReport[] = existingData ? JSON.parse(existingData) : [];
    
    // Add to beginning
    reports.unshift(newReport);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (e) {
    console.warn("Storage quota exceeded or restricted:", e);
  }
  return newReport;
};

export const getReports = (): SavedReport[] => {
  try {
    const existingData = localStorage.getItem(STORAGE_KEY);
    return existingData ? JSON.parse(existingData) : [];
  } catch (e) {
    console.warn("Failed to retrieve reports:", e);
    return [];
  }
};

export const deleteReport = (id: string): void => {
  try {
    const reports = getReports();
    const filtered = reports.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn("Failed to delete report:", e);
  }
};

export const getReportById = (id: string): SavedReport | undefined => {
  try {
    const reports = getReports();
    return reports.find(r => r.id === id);
  } catch (e) {
    console.warn("Error getting report:", e);
    return undefined;
  }
};
