import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { StockDatabase, StockReport, StockMovement, ReportStatus } from '../types/stock';
import bundledData from '../data/database.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId according to Firebase skill
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on start according to skill requirements
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'meta', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is offline or connecting.');
    }
    return false;
  }
}

// Initial seed helper to populate Firestore if empty
export async function seedFirestoreIfEmpty(): Promise<void> {
  const reportsCol = collection(db, 'reportes');
  try {
    const snapshot = await getDocs(reportsCol);
    if (snapshot.empty && bundledData && Array.isArray((bundledData as any).reportes)) {
      console.log('Sembrando Firestore con datos iniciales...');
      const seedReports = (bundledData as any).reportes as StockReport[];
      for (const r of seedReports) {
        await setDoc(doc(db, 'reportes', r.id), r);
      }
      await setDoc(doc(db, 'meta', 'counters'), {
        np: (bundledData as any).np || 5,
        nm: (bundledData as any).nm || 1,
      });
      console.log('Firestore sembrado con éxito.');
    }
  } catch (err) {
    console.warn('Aviso al comprobar siembra de Firestore:', err);
  }
}

// Cloud persistence functions
export async function saveReportToFirestore(report: StockReport): Promise<void> {
  const path = `reportes/${report.id}`;
  try {
    await setDoc(doc(db, 'reportes', report.id), report);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateReportStatusInFirestore(reportId: string, newStatus: ReportStatus): Promise<void> {
  const path = `reportes/${reportId}`;
  try {
    await setDoc(doc(db, 'reportes', reportId), { estado: newStatus }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveMovementToFirestore(
  movement: StockMovement,
  resolvedReportIds: string[]
): Promise<void> {
  const movePath = `movimientos/${movement.id}`;
  try {
    // Save movement
    await setDoc(doc(db, 'movimientos', movement.id), movement);

    // Update resolved reports
    for (const reportId of resolvedReportIds) {
      await setDoc(
        doc(db, 'reportes', reportId),
        { estado: 'Cerrado', mov: movement.id },
        { merge: true }
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, movePath);
  }
}

export async function deleteMovementInFirestore(
  movementId: string,
  linkedReportIds: string[]
): Promise<void> {
  const movePath = `movimientos/${movementId}`;
  try {
    await deleteDoc(doc(db, 'movimientos', movementId));
    for (const repId of linkedReportIds) {
      await setDoc(
        doc(db, 'reportes', repId),
        { estado: 'Abierto', mov: null },
        { merge: true }
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, movePath);
  }
}

export async function updateCountersInFirestore(np: number, nm: number): Promise<void> {
  const metaPath = 'meta/counters';
  try {
    await setDoc(doc(db, 'meta', 'counters'), { np, nm }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, metaPath);
  }
}
