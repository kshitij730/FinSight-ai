
import { VaultItem, UploadedFile, FinancialFact } from '../types';
import { extractDocumentFacts } from './gemini';
import { v4 as uuidv4 } from 'uuid';

const VAULT_KEY = 'finsight_memory_vault';

export const indexDocumentToVault = async (file: UploadedFile): Promise<VaultItem> => {
  // 1. Extract Facts using AI
  const extraction = await extractDocumentFacts(file);
  
  const newItem: VaultItem = {
    id: uuidv4(),
    fileName: file.name,
    dateIndexed: new Date().toISOString(),
    docType: file.docType || 'OTHER',
    facts: extraction.facts,
    summary: extraction.summary
  };

  // 2. Save to Local Storage (Client-Side Vector Store simulation)
  const existingVault = getVaultItems();
  const updatedVault = [newItem, ...existingVault];
  localStorage.setItem(VAULT_KEY, JSON.stringify(updatedVault));

  return newItem;
};

export const getVaultItems = (): VaultItem[] => {
  const data = localStorage.getItem(VAULT_KEY);
  return data ? JSON.parse(data) : [];
};

export const clearVault = (): void => {
  localStorage.removeItem(VAULT_KEY);
};

export const retrieveContext = (queryDocType: string): string => {
  // RAG Simulation: Retrieve relevant facts based on context
  // In a real app, this would use vector embeddings and semantic search.
  // Here, we grab all facts to fit into context window (assuming small demo usage).
  
  const vault = getVaultItems();
  if (vault.length === 0) return '';

  let contextString = "### HISTORICAL KNOWLEDGE VAULT (INTERNAL MEMORY) ###\n";
  
  vault.forEach(item => {
    contextString += `\nDOCUMENT: ${item.fileName} (${item.dateIndexed})\nSUMMARY: ${item.summary}\nKEY FACTS:\n`;
    item.facts.forEach(fact => {
      contextString += `- ${fact.metric}: ${fact.value} (${fact.dateContext})\n`;
    });
  });

  contextString += "\n### END OF VAULT ###\n";
  return contextString;
};
