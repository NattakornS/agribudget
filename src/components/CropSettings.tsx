import CropMap from "@/components/CropMap";
import EditModal from "@/components/EditModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDuration, formatArea, convertToSqm, convertFromSqm } from "@/lib/utils";
import {
  createCrop,
  deleteCrop,
  getCrops,
  updateCrop,
} from "@/services/cropService";
import type { Crop, CropFormData } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Calendar,
  Edit,
  Hash,
  MapPin,
  Plus,
  Ruler,
  Sprout,
  Trash2
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
const cropSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  area: z.coerce
    .number()
    .positive("Area must be a positive number")
    .optional()
    .or(z.literal("")),
  amount: z.coerce
    .number()
    .int("Amount must be an integer")
    .positive()
    .optional()
    .or(z.literal("")),
  started_date: z.string().optional().nullable(),
});

interface CropSettingsProps {
  autoOpenModal?: boolean;
  onModalClose?: () => void;
}

const CropSettings = ({
  autoOpenModal = false,
  onModalClose,
}: CropSettingsProps) => {
  const { t,language } = useLanguage();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [selectedMapLocation, setSelectedMapLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const defaultValues: CropFormData = {
    name: "",
    location: "",
    latitude: null,
    longitude: null,
    area: null,
    amount: null,
    started_date: null,
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CropFormData>({
    // @ts-ignore - Skip type checking for resolver
    resolver: zodResolver(cropSchema),
    defaultValues,
  });

  const watchedArea = watch("area");

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        setLoading(true);
        const data = await getCrops();
        setCrops(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCrops();
  }, []);

  useEffect(() => {
    if (autoOpenModal && !loading && crops.length === 0) {
      handleOpenModal();
    }
  }, [autoOpenModal, loading, crops.length]);

  const refreshCrops = async () => {
    try {
      const data = await getCrops();
      setCrops(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddCrop = async (data: CropFormData) => {
    try {
      // Clean up empty string values from optional number fields
      const cleanedData = {
        ...data,
        area: data.area ? convertToSqm(Number(data.area), language) : null,
        amount: data.amount || null,
        started_date: data.started_date || null,
      };
      await createCrop(cleanedData);
      await refreshCrops();
      setIsModalOpen(false);
      reset(defaultValues);
      onModalClose?.();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateCrop = async (data: CropFormData) => {
    if (!selectedCrop) return;
    try {
      // Clean up empty string values from optional number fields
      const cleanedData = {
        ...data,
        area: data.area ? convertToSqm(Number(data.area), language) : null,
        amount: data.amount || null,
        started_date: data.started_date || null,
      };
      await updateCrop(selectedCrop.id, cleanedData);
      await refreshCrops();
      setIsModalOpen(false);
      setSelectedCrop(null);
      reset(defaultValues);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteCrop = async () => {
    if (!selectedCrop) return;
    if (window.confirm(t("confirmDeleteCrop"))) {
      try {
        await deleteCrop(selectedCrop.id);
        await refreshCrops();
        setIsModalOpen(false);
        setSelectedCrop(null);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setValue("latitude", lat);
    setValue("longitude", lng);
    setSelectedMapLocation({ lat, lng });
  };

  const handleOpenModal = (crop?: Crop) => {
    if (crop) {
      setSelectedCrop(crop);
      setValue("name", crop.name);
      setValue("location", crop.location || "");
      setValue("latitude", crop.latitude);
      setValue("longitude", crop.longitude);
      setValue("area", crop.area ? convertFromSqm(crop.area, language) : null);
      setValue("amount", crop.amount);
      setValue(
        "started_date",
        crop.started_date ? crop.started_date.split("T")[0] : ""
      );
      setSelectedMapLocation(
        crop.latitude && crop.longitude
          ? { lat: crop.latitude, lng: crop.longitude }
          : null
      );
    } else {
      setSelectedCrop(null);
      setSelectedMapLocation(null);
      reset(defaultValues);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCrop(null);
    setSelectedMapLocation(null);
    reset(defaultValues);
    onModalClose?.();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className=" grid gap-6 md:grid-cols-2">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Crop Locations Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t("cropLocations")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <CropMap crops={crops} height={400} />
          </CardContent>
        </Card>

        {/* Existing Crops */}
        <Card>
          <CardHeader className="flex justify-between items-start">
            <CardTitle className="flex-1 flex items-center gap-2">
              <Sprout className="h-5 w-5" />
              {t("yourCrops")} ({crops.length})
            </CardTitle>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenModal()}
              >
                <Plus className="h-4 w-4" />{t("add")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {crops.length === 0 ? (
              <div className="text-center py-8">
                <Sprout className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t("noCropsAdded")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("addFirstCrop")}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {crops.map((crop) => (
                  <Card key={crop.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">
                            {crop.name}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                            {crop.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {crop.location}
                              </div>
                            )}
                            {crop.latitude && crop.longitude && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-blue-600" />
                                {crop.latitude.toFixed(4)},{" "}
                                {crop.longitude.toFixed(4)}
                              </div>
                            )}
                            {crop.area && (
                              <div className="flex items-center gap-1">
                                <Ruler className="h-3 w-3" />
                                {formatArea(crop.area, language)}
                              </div>
                            )}
                            {crop.amount && (
                              <div className="flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                {crop.amount} {t("units")}
                              </div>
                            )}
                            {crop.started_date && (
                              <div className="flex gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(crop.started_date).toLocaleDateString()} ({getDuration(crop.started_date,"",language)})
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenModal(crop)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              if (window.confirm(t("confirmDeleteCrop"))) {
                                try {
                                  await deleteCrop(crop.id);
                                  await refreshCrops();
                                } catch (err: any) {
                                  setError(err.message);
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* <FloatingActionButton onClick={() => handleOpenModal()} /> */}

      <EditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSubmit((data: any) => {
          if (selectedCrop) {
            return handleUpdateCrop(data as CropFormData);
          }
          return handleAddCrop(data as CropFormData);
        })}
        onDelete={selectedCrop ? handleDeleteCrop : () => {}}
        title={selectedCrop ? t("editCrop") : t("addCrop")}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("cropName")} *</Label>
              <Input
                id="name"
                placeholder={t("cropNamePlaceholder")}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t("cropLocation")}</Label>
              <Input
                id="location"
                placeholder={t("cropLocationPlaceholder")}
                {...register("location")}
              />
            </div>
          </div>

          {/* Map for location selection */}
          <div className="space-y-2">
            <Label>{t("geographicLocation")}</Label>
            {/* @ts-ignore - Skip type checking for isModal prop */}
            <CropMap
              crops={[]}
              height={250}
              onMapClick={handleMapClick}
              selectedLocation={selectedMapLocation}
              showClickInstruction={true}
              isModal={true}
            />
            {selectedMapLocation && (
              <div className="text-sm text-muted-foreground mt-2">
                {t("selectedLocation")}: {selectedMapLocation.lat.toFixed(6)},{" "}
                {selectedMapLocation.lng.toFixed(6)}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area">{t("cropArea")}</Label>
              <Input
                id="area"
                type="number"
                step="0.01"
                placeholder={language === 'th' ? "0.63" : "0.1"}
                {...register("area")}
              />
              {/* {watchedArea && !isNaN(Number(watchedArea)) && Number(watchedArea) > 0 && (
                <p className="text-xs text-muted-foreground">
                  {Number(watchedArea).toFixed(2)} {language === 'th' ? 'ไร่' : 'hectares'}
                </p>
              )} */}
              {errors.area && (
                <p className="text-sm text-destructive">
                  {errors.area.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">{t("cropAmount")}</Label>
              <Input
                id="amount"
                type="number"
                placeholder={t("cropAmountPlaceholder")}
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="started_date">{t("plantedDate")}</Label>
              <Input
                id="started_date"
                type="date"
                {...register("started_date")}
              />
            </div>
          </div>
        </div>
      </EditModal>
    </>
  );
};

export default CropSettings;
