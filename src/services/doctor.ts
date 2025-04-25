/**
 * Represents a doctor's information.
 */
export interface Doctor {
  id: string;
  name: string;
  specialty: string[];
  experience: number;
  fee: number;
  consultationMode: 'Video Consult' | 'In Clinic';
}

/**
 * Asynchronously retrieves a list of doctors.
 * @returns A promise that resolves to an array of Doctor objects.
 */
export async function getDoctors(): Promise<Doctor[]> {
  try {
    const response = await fetch('https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as Doctor[];
  } catch (error) {
    console.error("Could not fetch doctors:", error);
    return [];
  }
}
