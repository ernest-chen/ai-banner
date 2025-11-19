import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getDb, storage } from './firebase';
import { GeneratedBanner, User, BannerGenerationRequest } from '@/types/banner';

export class DatabaseService {
  // User operations
  async createUser(user: User): Promise<void> {
    const userRef = doc(getDb(), 'users', user.id);
    await updateDoc(userRef, {
      ...user,
      createdAt: Timestamp.fromDate(user.createdAt)
    });
  }

  async getUser(userId: string): Promise<User | null> {
    const userRef = doc(getDb(), 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        id: userSnap.id,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        createdAt: data.createdAt?.toDate() || new Date(),
        subscription: data.subscription || 'free'
      };
    }
    
    return null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const userRef = doc(getDb(), 'users', userId);
    await updateDoc(userRef, updates);
  }

  // Banner operations
  async saveBanner(banner: Omit<GeneratedBanner, 'id'>): Promise<string> {
    const bannerRef = await addDoc(collection(getDb(), 'banners'), {
      ...banner,
      createdAt: Timestamp.fromDate(banner.createdAt)
    });
    return bannerRef.id;
  }

  async getUserBanners(userId: string): Promise<GeneratedBanner[]> {
    const q = query(
      collection(getDb(), 'banners'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const banners = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as GeneratedBanner[];
    
    console.log('Retrieved banners:', banners.map(b => ({ id: b.id, imageUrl: b.imageUrl, hasRequest: !!b.request })));
    return banners;
  }

  async getPublicBanners(limitCount: number = 20): Promise<GeneratedBanner[]> {
    const q = query(
      collection(getDb(), 'banners'),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as GeneratedBanner[];
  }

  async deleteBanner(bannerId: string): Promise<void> {
    const bannerRef = doc(getDb(), 'banners', bannerId);
    await deleteDoc(bannerRef);
  }

  async updateBanner(bannerId: string, updates: Partial<GeneratedBanner>): Promise<void> {
    const bannerRef = doc(getDb(), 'banners', bannerId);
    await updateDoc(bannerRef, updates);
  }

  // File storage operations
  async uploadLogo(file: File, userId: string): Promise<string> {
    const fileName = `logos/${userId}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  async uploadBannerImage(imageBlob: Blob, userId: string, bannerId: string): Promise<string> {
    const fileName = `banners/${userId}/${bannerId}-${Date.now()}.png`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, imageBlob);
    return await getDownloadURL(storageRef);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  }

  // Analytics operations
  async trackBannerGeneration(userId: string, request: BannerGenerationRequest): Promise<void> {
      await addDoc(collection(getDb(), 'analytics'), {
      type: 'banner_generation',
      userId,
      request: {
        size: request.size.id,
        theme: request.theme.id,
        useCase: request.useCase.id,
        hasCustomText: !!request.customText,
        hasLogo: !!request.logo,
        hasContext: !!request.context
      },
      timestamp: Timestamp.now()
    });
  }

  async trackBannerDownload(bannerId: string, userId: string): Promise<void> {
      await addDoc(collection(getDb(), 'analytics'), {
      type: 'banner_download',
      bannerId,
      userId,
      timestamp: Timestamp.now()
    });
  }

  // Usage tracking
  async getUserUsage(userId: string, month: string): Promise<number> {
    const startOfMonth = new Date(month + '-01');
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);
    
    const q = query(
      collection(getDb(), 'analytics'),
      where('userId', '==', userId),
      where('type', '==', 'banner_generation'),
      where('timestamp', '>=', Timestamp.fromDate(startOfMonth)),
      where('timestamp', '<=', Timestamp.fromDate(endOfMonth))
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  }
}

export const databaseService = new DatabaseService();
