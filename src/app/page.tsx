"use client";

import { useEffect, useState } from "react";
import type { Doctor } from "@/services/doctor";
import { getDoctors } from "@/services/doctor";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MapPin, Building, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

const SPECIALTIES = [
	"General Physician",
	"Dentist",
	"Dermatologist",
	"Paediatrician",
	"Gynaecologist",
	"ENT",
	"Diabetologist",
	"Cardiologist",
	"Physiotherapist",
	"Endocrinologist",
	"Orthopaedic",
	"Ophthalmologist",
	"Gastroenterologist",
	"Pulmonologist",
	"Psychiatrist",
	"Urologist",
	"Dietitian-Nutritionist",
	"Psychologist",
	"Sexologist",
	"Nephrologist",
	"Neurologist",
	"Oncologist",
	"Ayurveda",
	"Homeopath",
];

const CONSULTATION_MODES = ["Video Consult", "In Clinic"];

export default function Home() {
	const [doctors, setDoctors] = useState<Doctor[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
	const [consultationMode, setConsultationMode] = useState<string | null>(null);
	const [specialties, setSpecialties] = useState<string[]>([]);
	const [sortOption, setSortOption] = useState<string | null>(null);
	const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<
		Doctor[]
	>([]);

	const searchParams = useSearchParams();
	const router = useRouter();

	useEffect(() => {
		async function loadDoctors() {
			const allDoctors = await getDoctors();
			setDoctors(allDoctors);
		}

		loadDoctors();
	}, []);

	useEffect(() => {
		// Apply filters and search
		let results = [...doctors];

		if (searchTerm) {
			results = results.filter(
				(doctor) =>
					doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					doctor.specialities.some((s) =>
						s.name.toLowerCase().includes(searchTerm.toLowerCase())
					)
			);
		}

		if (consultationMode) {
			results = results.filter(
				(doctor) =>
					(doctor.video_consult === true &&
						consultationMode === "Video Consult") ||
					(doctor.in_clinic === true && consultationMode === "In Clinic")
			);
		}

		if (specialties.length > 0) {
			results = results.filter((doctor) =>
				doctor.specialities.some((s) => specialties.includes(s.name))
			);
		}

		// Apply sorting
		if (sortOption === "fees") {
			results.sort(
				(a, b) =>
					parseInt(a.fees.replace(/[₹ ]/g, "")) -
					parseInt(b.fees.replace(/[₹ ]/g, ""))
			);
		} else if (sortOption === "experience") {
			results.sort(
				(a, b) =>
					parseInt(b.experience.replace(/ Years of experience/g, "")) -
					parseInt(a.experience.replace(/ Years of experience/g, ""))
			);
		}

		setFilteredDoctors(results);

		// Update URL params
		const params = new URLSearchParams(searchParams);
		if (searchTerm) params.set("search", searchTerm);
		else params.delete("search");
		if (consultationMode) params.set("mode", consultationMode);
		else params.delete("mode");
		if (specialties.length > 0)
			params.set("specialties", specialties.join(","));
		else params.delete("specialties");
		if (sortOption) params.set("sort", sortOption);
		else params.delete("sort");

		router.push(`/?${params.toString()}`);
	}, [
		doctors,
		searchTerm,
		consultationMode,
		specialties,
		sortOption,
		router,
		searchParams,
	]);

	useEffect(() => {
		// Read filters from URL on initial load
		const initialSearchTerm = searchParams.get("search") || "";
		const initialMode = searchParams.get("mode") || null;
		const initialSpecialties =
			searchParams.get("specialties")?.split(",") || [];
		const initialSort = searchParams.get("sort") || null;

		setSearchTerm(initialSearchTerm);
		setConsultationMode(initialMode);
		setSpecialties(initialSpecialties);
		setSortOption(initialSort);
	}, [searchParams]);

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
		setSearchTerm(value);

		// Update autocomplete suggestions
		if (value) {
			const suggestions = doctors
				.filter((doctor) =>
					doctor.name.toLowerCase().includes(value.toLowerCase())
				)
				.slice(0, 3);
			setAutocompleteSuggestions(suggestions);
		} else {
			setAutocompleteSuggestions([]);
		}
	};

	const handleSuggestionClick = (suggestion: Doctor) => {
		setSearchTerm(suggestion.name);
		setAutocompleteSuggestions([]);
	};

	const handleConsultationModeChange = (mode: string | null) => {
		setConsultationMode(mode);
	};

	const handleSpecialtyChange = (specialty: string) => {
		setSpecialties((prev) => {
			if (prev.includes(specialty)) {
				return prev.filter((s) => s !== specialty);
			} else {
				return [...prev, specialty];
			}
		});
	};

	const handleSortOptionChange = (option: string | null) => {
		setSortOption(option);
	};

	return (
		<Suspense fallback={<p>Loading...</p>}>
			<div className="bg-white">
				<div className="bg-primary py-4">
					<div className="container mx-auto p-4 relative">
						{/* Autocomplete Header */}
						<div className="relative">
							<div className="relative">
								<Input
									type="text"
									placeholder="Search doctor..."
									value={searchTerm}
									onChange={handleSearchChange}
									data-testid="autocomplete-input"
									className="pl-10"
								/>
								<Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
							</div>
							{autocompleteSuggestions.length > 0 && (
								<Card className="absolute top-12 left-0 w-full shadow-md">
									<CardContent className="p-0">
										<ul className="divide-y divide-border">
											{autocompleteSuggestions.map((doctor) => (
												<li
													key={doctor.id}
													onClick={() => handleSuggestionClick(doctor)}
													className="flex items-center justify-between p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer"
													data-testid="suggestion-item"
												>
													<div className="flex items-center">
														<Avatar className="mr-2 h-8 w-8">
															<AvatarImage
																style={{ marginTop: "0.5rem" }}
																src={doctor.photo}
																alt={doctor.name}
															/>
															<AvatarFallback>
																{doctor.name_initials}
															</AvatarFallback>
														</Avatar>
														<div>
															<p className="font-semibold">{doctor.name}</p>
															<p className="text-sm text-muted-foreground">
																{doctor.specialities
																	.map((s) => s.name)
																	.join(", ")}
															</p>
														</div>
													</div>
													<ChevronRight className="h-4 w-4 text-muted-foreground" />
												</li>
											))}
										</ul>
									</CardContent>
								</Card>
							)}
						</div>
					</div>
				</div>

				<div className="container mx-auto p-4">
					{/* Filter Panel */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="md:col-span-1">
							{/* Consultation Mode Filter */}
							<div className="mb-4">
								<h3
									className="font-semibold mb-2"
									data-testid="filter-header-moc"
								>
									Consultation Mode
								</h3>
								<RadioGroup
									defaultValue={consultationMode || undefined}
									onValueChange={handleConsultationModeChange}
								>
									<div className="flex items-center space-x-2">
										<RadioGroupItem
											value="Video Consult"
											id="video"
											data-testid="filter-video-consult"
										/>
										<label
											htmlFor="video"
											className="cursor-pointer"
										>
											Video Consult
										</label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem
											value="In Clinic"
											id="clinic"
											data-testid="filter-in-clinic"
										/>
										<label
											htmlFor="clinic"
											className="cursor-pointer"
										>
											In Clinic
										</label>
									</div>
								</RadioGroup>
							</div>

							{/* Specialty Filter */}
							<div className="mb-4">
								<h3
									className="font-semibold mb-2"
									data-testid="filter-header-specialties"
								>
									Specialties
								</h3>
								<div>
									{SPECIALTIES.map((specialty) => (
										<div
											key={specialty}
											className="flex items-center space-x-2"
										>
											<Checkbox
												checked={specialties.includes(specialty)}
												onChange={() => handleSpecialtyChange(specialty)}
												id={specialty}
												data-testid={`filter-${specialty}`}
											/>
											<label
												htmlFor={specialty}
												className="cursor-pointer"
											>
												{specialty}
											</label>
										</div>
									))}
								</div>
							</div>

							{/* Sort By */}
							<div className="mb-4">
								<h3 className="font-semibold mb-2">Sort By</h3>
								<div className="space-y-2">
									<Button
										onClick={() => handleSortOptionChange("fees")}
										variant={sortOption === "fees" ? "outline" : "default"}
										data-testid="sort-by-fees"
									>
										Fees
									</Button>
									<Button
										onClick={() => handleSortOptionChange("experience")}
										variant={
											sortOption === "experience" ? "outline" : "default"
										}
										data-testid="sort-by-experience"
									>
										Experience
									</Button>
								</div>
							</div>
						</div>

						{/* Doctor List */}
						<div className="md:col-span-3">
							{/* Doctor Cards */}
							{filteredDoctors.length > 0 ? (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{filteredDoctors.map((doctor) => (
										<Card key={doctor.id}>
											<CardContent>
												<div className="flex">
													<Avatar>
														<AvatarImage
															src={doctor.photo}
															alt={doctor.name}
														/>
													</Avatar>
													<div className="ml-4">
														<p className="font-semibold text-lg">
															{doctor.name}
														</p>
														<p>
															{doctor.specialities
																.map((s) => s.name)
																.join(", ")}
														</p>
														<p className="text-sm text-muted-foreground">
															{doctor.experience} years of experience
														</p>
														<p className="font-bold">{doctor.fees}</p>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<p>No doctors found matching your criteria.</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</Suspense>
	);
}
