import fs from 'fs';
import path from 'path';
import {
  IStorage,
  StoredUser,
  StoredFaultClass,
  StoredAnswers,
  StoredGlobalAnswers,
} from './types';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

const EMPTY_GLOBAL_ANSWERS: StoredGlobalAnswers = {
  s1_new_fault_classes: null,
  s1_disputed_fault_classes: null,
  s1_rare_obsolete: null,
  s3_highest_impact: null,
  s3_hardest_to_diagnose: null,
  s3_most_misdiagnosed: null,
  s3_first_to_improve: null,
  s3_unlisted_faults: null,
  s3_additional_endpoints: null,
  s3_data_quality_issues: null,
  s3_historical_cases: null,
  s3_real_scenarios: null,
  s3_wrong_recommendation: null,
};

function readJson<T>(file: string): T {
  const content = fs.readFileSync(file, 'utf-8');
  return JSON.parse(content) as T;
}

function writeJson<T>(file: string, data: T): void {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

export class CsvStorage implements IStorage {
  private usersFile: string;
  private faultClassesFile: string;
  private answersFile: string;
  private globalAnswersFile: string;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    this.usersFile = path.join(DATA_DIR, 'users.json');
    this.faultClassesFile = path.join(DATA_DIR, 'fault_classes.json');
    this.answersFile = path.join(DATA_DIR, 'fault_class_answers.json');
    this.globalAnswersFile = path.join(DATA_DIR, 'global_answers.json');

    if (!fs.existsSync(this.usersFile)) {
      writeJson<StoredUser[]>(this.usersFile, []);
    }
    if (!fs.existsSync(this.faultClassesFile)) {
      writeJson<StoredFaultClass[]>(this.faultClassesFile, []);
    }
    if (!fs.existsSync(this.answersFile)) {
      writeJson<StoredAnswers[]>(this.answersFile, []);
    }
    if (!fs.existsSync(this.globalAnswersFile)) {
      writeJson<StoredGlobalAnswers>(this.globalAnswersFile, EMPTY_GLOBAL_ANSWERS);
    }
  }

  async findUserByUsername(username: string): Promise<StoredUser | null> {
    const users = readJson<StoredUser[]>(this.usersFile);
    const user = users.find((u) => u.username === username);
    return user || null;
  }

  async getFaultClasses(): Promise<StoredFaultClass[]> {
    const faultClasses = readJson<StoredFaultClass[]>(this.faultClassesFile);
    return [...faultClasses].sort((a, b) => a.number - b.number);
  }

  async updateFaultClass(
    id: number,
    data: { engineer_validated: boolean; priority_to_improve: string | null }
  ): Promise<StoredFaultClass> {
    const faultClasses = readJson<StoredFaultClass[]>(this.faultClassesFile);
    const index = faultClasses.findIndex((fc) => fc.id === id);
    if (index === -1) {
      throw new Error(`Fault class with id ${id} not found`);
    }
    faultClasses[index] = {
      ...faultClasses[index],
      engineer_validated: data.engineer_validated,
      priority_to_improve: data.priority_to_improve,
    };
    writeJson<StoredFaultClass[]>(this.faultClassesFile, faultClasses);
    return faultClasses[index];
  }

  async getAnswers(faultClassId: number): Promise<StoredAnswers | null> {
    const allAnswers = readJson<StoredAnswers[]>(this.answersFile);
    const found = allAnswers.find((a) => a.fault_class_id === faultClassId);
    return found || null;
  }

  async upsertAnswers(faultClassId: number, answers: Partial<StoredAnswers>): Promise<StoredAnswers> {
    const allAnswers = readJson<StoredAnswers[]>(this.answersFile);
    const index = allAnswers.findIndex((a) => a.fault_class_id === faultClassId);

    const updated: StoredAnswers = {
      fault_class_id: faultClassId,
      s2a_description: answers.s2a_description !== undefined ? answers.s2a_description : null,
      s2a_commonality: answers.s2a_commonality !== undefined ? answers.s2a_commonality : null,
      s2a_intermittent: answers.s2a_intermittent !== undefined ? answers.s2a_intermittent : null,
      s2a_appears_with: answers.s2a_appears_with !== undefined ? answers.s2a_appears_with : null,
      s2b_clearest_signal: answers.s2b_clearest_signal !== undefined ? answers.s2b_clearest_signal : null,
      s2b_signal_combination: answers.s2b_signal_combination !== undefined ? answers.s2b_signal_combination : null,
      s2b_lifecycle_point: answers.s2b_lifecycle_point !== undefined ? answers.s2b_lifecycle_point : null,
      s2b_not_this_fault: answers.s2b_not_this_fault !== undefined ? answers.s2b_not_this_fault : null,
      s2b_confused_with: answers.s2b_confused_with !== undefined ? answers.s2b_confused_with : null,
      s2c_diagnostics: answers.s2c_diagnostics !== undefined ? answers.s2c_diagnostics : [],
      s2c_thresholds: answers.s2c_thresholds !== undefined ? answers.s2c_thresholds : null,
      s2c_additional_sources: answers.s2c_additional_sources !== undefined ? answers.s2c_additional_sources : null,
      s2d_resolution_steps: answers.s2d_resolution_steps !== undefined ? answers.s2d_resolution_steps : [],
      s2d_resolution_time: answers.s2d_resolution_time !== undefined ? answers.s2d_resolution_time : null,
      s2d_escalation_required: answers.s2d_escalation_required !== undefined ? answers.s2d_escalation_required : null,
      s2e_correct_response: answers.s2e_correct_response !== undefined ? answers.s2e_correct_response : null,
      s2e_example_case: answers.s2e_example_case !== undefined ? answers.s2e_example_case : null,
      s2e_edge_cases: answers.s2e_edge_cases !== undefined ? answers.s2e_edge_cases : null,
      s4_existing_docs: answers.s4_existing_docs !== undefined ? answers.s4_existing_docs : false,
      s4_needs_creating: answers.s4_needs_creating !== undefined ? answers.s4_needs_creating : null,
      s4_priority: answers.s4_priority !== undefined ? answers.s4_priority : null,
      s4_definition_chunk: answers.s4_definition_chunk !== undefined ? answers.s4_definition_chunk : false,
      s4_diagnostic_chunk: answers.s4_diagnostic_chunk !== undefined ? answers.s4_diagnostic_chunk : false,
      s4_resolution_chunk: answers.s4_resolution_chunk !== undefined ? answers.s4_resolution_chunk : false,
      s4_example_cases: answers.s4_example_cases !== undefined ? answers.s4_example_cases : false,
    };

    if (index === -1) {
      allAnswers.push(updated);
    } else {
      allAnswers[index] = updated;
    }

    writeJson<StoredAnswers[]>(this.answersFile, allAnswers);
    return updated;
  }

  async getAllAnswersForExport(): Promise<StoredAnswers[]> {
    return readJson<StoredAnswers[]>(this.answersFile);
  }

  async getGlobalAnswers(): Promise<StoredGlobalAnswers> {
    return readJson<StoredGlobalAnswers>(this.globalAnswersFile);
  }

  async updateGlobalAnswers(answers: Partial<StoredGlobalAnswers>): Promise<StoredGlobalAnswers> {
    const existing = readJson<StoredGlobalAnswers>(this.globalAnswersFile);
    const updated: StoredGlobalAnswers = { ...existing, ...answers };
    writeJson<StoredGlobalAnswers>(this.globalAnswersFile, updated);
    return updated;
  }
}
