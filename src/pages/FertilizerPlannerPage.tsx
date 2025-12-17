import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useYearFilter } from "@/contexts/YearFilterContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type {
  Crop,
  Expense,
  FertilizerPlan,
  FertilizerPlanFormData,
  PlanStatus,
} from "@/types";
import { getCrops } from "@/services/cropService";
import { getExpenses } from "@/services/expenseService";
import {
  getFertilizerPlans,
  createFertilizerPlan,
  deleteFertilizerPlan,
  updatePlanStatus,
  updateFertilizerPlan,
} from "@/services/fertilizerService";
import { KanbanBoard } from "@/components/fertilizer/KanbanBoard";
import { ViewToggle } from "@/components/fertilizer/ViewToggle";
import FloatingActionButton from "@/components/FloatingActionButton";
import RecordList from "@/components/RecordList";
import EditModal from "@/components/EditModal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  PlayCircle,
} from "lucide-react";
import { useCropFilter } from "@/contexts/CropFilterContext";
import { getDuration } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const planSchema = z.object({
  crop_id: z.string().min(1, "Please select a crop"),
  plan_date: z.string().min(1, "Date is required"),
  status: z.enum(["plan", "doing", "complete"]),
  stage: z.string().optional(),
  fertilizer_type: z.string().optional(),
  amount_kg: z.number().positive().optional(),
  detail: z.string().optional(),
  linked_expense_ids: z.array(z.string()).default([]),
});

const FertilizerPlannerPage = () => {
  const { t } = useLanguage();
  const [plans, setPlans] = useState<FertilizerPlan[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<FertilizerPlan | null>(null);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  const { selectedCropId } = useCropFilter();
  const { selectedYear, isAllYears } = useYearFilter();

  const defaultValues = {
    plan_date: new Date().toISOString().split("T")[0],
    status: "plan" as PlanStatus,
    crop_id: "",
    stage: "",
    fertilizer_type: "",
    amount_kg: undefined,
    detail: "",
    linked_expense_ids: [],
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FertilizerPlanFormData>({
    // @ts-ignore - Skip type checking for resolver
    resolver: zodResolver(planSchema),
    defaultValues,
  });

  // Filter plans based on year
  const filteredPlans = useMemo(() => {
    if (isAllYears) return plans;
    return plans.filter((plan) => {
      const planYear = new Date(plan.plan_date).getFullYear();
      const matchesYear = planYear === selectedYear;
      const matchesCrop = !selectedCropId || plan.crop_id === selectedCropId;
      return matchesYear && matchesCrop;
    });
  }, [plans, selectedYear, isAllYears, selectedCropId]);

  const refreshPlans = async () => {
    try {
      const plansData = await getFertilizerPlans();
      setPlans(plansData as FertilizerPlan[]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [plansData, cropsData, expensesData] = await Promise.all([
          getFertilizerPlans(),
          getCrops(),
          getExpenses(),
        ]);
        setPlans(plansData as FertilizerPlan[]);
        setCrops(cropsData);
        // Filter for expenses that might be fertilizer-related
        const fertilizerExpenses = (
          expensesData as unknown as Expense[]
        ).filter(
          (expense) =>
            expense.categories?.name?.toLowerCase().includes("fertilizer") ||
            expense.categories?.name?.toLowerCase().includes("nutrient") ||
            expense.categories?.name?.toLowerCase().includes("pesticide")
        );
        setExpenses(fertilizerExpenses);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdatePlan = async (data: FertilizerPlanFormData) => {
    if (!selectedPlan) return;
    try {
      const formDataWithExpenses = {
        ...data,
        linked_expense_ids: selectedExpenseIds,
      };
      await updateFertilizerPlan(selectedPlan.id, formDataWithExpenses);
      await refreshPlans();
      setIsModalOpen(false);
      setSelectedPlan(null);
      setSelectedExpenseIds([]);
      reset(defaultValues);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddPlan = async (data: FertilizerPlanFormData) => {
    try {
      const formDataWithExpenses = {
        ...data,
        linked_expense_ids: selectedExpenseIds,
      };
      await createFertilizerPlan(formDataWithExpenses);
      await refreshPlans();
      setIsModalOpen(false);
      setSelectedExpenseIds([]);
      reset(defaultValues);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;
    if (
      window.confirm("Are you sure you want to delete this fertilizer plan?")
    ) {
      try {
        await deleteFertilizerPlan(selectedPlan.id);
        await refreshPlans();
        setIsModalOpen(false);
        setSelectedPlan(null);
        setSelectedExpenseIds([]);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleStatusChange = async (planId: string, newStatus: PlanStatus) => {
    try {
      await updatePlanStatus(planId, newStatus);
      await refreshPlans();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleOpenModal = (plan?: FertilizerPlan) => {
    if (plan) {
      setSelectedPlan(plan);
      setValue("crop_id", plan.crop_id);
      setValue("plan_date", plan.plan_date.split("T")[0]);
      setValue("status", plan.status);
      setValue("stage", plan.stage || "");
      setValue("fertilizer_type", plan.fertilizer_type || "");
      setValue("amount_kg", plan.amount_kg || undefined);
      setValue("detail", plan.detail || "");
      // Set linked expenses if available
      const linkedExpenseIds = plan.expenses?.map((exp) => exp.id) || [];
      setSelectedExpenseIds(linkedExpenseIds);
    } else {
      setSelectedPlan(null);
      setSelectedExpenseIds([]);
      reset(defaultValues);
    }
    setIsModalOpen(true);
  };

  const getStatusIcon = (status: PlanStatus) => {
    switch (status) {
      case "plan":
        return <Clock className="h-4 w-4" />;
      case "doing":
        return <PlayCircle className="h-4 w-4" />;
      case "complete":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: PlanStatus) => {
    switch (status) {
      case "plan":
        return "bg-gray-500";
      case "doing":
        return "bg-blue-500";
      case "complete":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const renderPlanItem = (plan: FertilizerPlan) => {
    return (
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-foreground">
              {plan.fertilizer_type || t("fertilizerPlanner.defaultTitle")}
            </h3>
            <Badge variant="secondary">{plan.crops?.name || "No Crop"}</Badge>
            <Badge className={`text-white ${getStatusColor(plan.status)}`}>
              <div className="flex items-center gap-1">
                {getStatusIcon(plan.status)}
                {t(`status.${plan.status}`)}
              </div>
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
            <Calendar className="h-3 w-3" />
            {new Date(plan.plan_date).toLocaleDateString()} (
            {getDuration(plan.plan_date)})
          </div>
          {plan.stage && (
            <p className="text-sm text-muted-foreground mb-1">
              {t("fertilizerPlanner.stage")}: {plan.stage}
            </p>
          )}
          {plan.amount_kg && (
            <p className="text-sm text-muted-foreground mb-1">
              {t("fertilizerPlanner.amount")}: {plan.amount_kg} kg
            </p>
          )}
          {plan.detail && (
            <p className="text-sm text-muted-foreground mb-1">{plan.detail}</p>
          )}
          {plan.expenses && plan.expenses.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {t("fertilizerPlanner.linkedTo")} {plan.expenses.length}{" "}
              {t("fertilizerPlanner.expenses")}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {plan.status !== "complete" && (
            <div className="flex gap-1">
              {plan.status === "plan" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(plan.id, "doing");
                  }}
                >
                  {t("actions.start")}
                </Button>
              )}
              {plan.status === "doing" && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(plan.id, "complete");
                  }}
                >
                  {t("actions.complete")}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const getStatusCounts = () => {
    const counts = {
      plan: filteredPlans.filter((p) => p.status === "plan").length,
      doing: filteredPlans.filter((p) => p.status === "doing").length,
      complete: filteredPlans.filter((p) => p.status === "complete").length,
    };
    return counts;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("fertilizerPlanner.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("fertilizerPlanner.description")}
          </p>
        </div>
        <ViewToggle view={viewMode} onViewChange={setViewMode} />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Status Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="p-2 sm:p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            <div>
              <div className="text-base sm:text-lg font-semibold">
                {t("status.plan")}
              </div>
              <div className="text-lg sm:text-2xl font-bold text-gray-600">
                {statusCounts.plan}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-4">
          <div className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            <div>
              <div className="text-base sm:text-lg font-semibold">
                {t("status.doing")}
              </div>
              <div className="text-lg sm:text-2xl font-bold text-blue-600">
                {statusCounts.doing}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            <div>
              <div className="text-base sm:text-lg font-semibold">
                {t("status.complete")}
              </div>
              <div className="text-lg sm:text-2xl font-bold text-green-600">
                {statusCounts.complete}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Plans List */}
      <div className="relative">
        {viewMode === "list" ? (
          <RecordList
            records={filteredPlans}
            onRecordClick={handleOpenModal}
            renderItem={renderPlanItem}
          />
        ) : (
          <KanbanBoard
            plans={filteredPlans}
            onStatusUpdate={(updatedPlan) => {
              setPlans((prevPlans) =>
                prevPlans.map((plan) =>
                  plan.id === updatedPlan.id ? updatedPlan : plan
                )
              );
            }}
          />
        )}
        <FloatingActionButton onClick={() => handleOpenModal()} />
      </div>

      <EditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPlan(null);
          setSelectedExpenseIds([]);
          reset(defaultValues);
        }}
        onSave={handleSubmit((data: any) => {
          if (selectedPlan) {
            return handleUpdatePlan(data as FertilizerPlanFormData);
          }
          return handleAddPlan(data as FertilizerPlanFormData);
        })}
        onDelete={
          selectedPlan
            ? () => {
                void handleDeletePlan();
              }
            : () => {}
        }
        title={
          selectedPlan
            ? t("fertilizerPlanner.editTitle")
            : t("fertilizerPlanner.addTitle")
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t("form.crop")} *</label>
            <Select
              value={watch("crop_id")}
              onValueChange={(value) => setValue("crop_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("form.selectCrop")} />
              </SelectTrigger>
              <SelectContent>
                {crops.map((crop) => (
                  <SelectItem key={crop.id} value={crop.id}>
                    {crop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.crop_id && (
              <p className="text-sm text-destructive mt-1">
                {errors.crop_id.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">
              {t("form.planDate")} *
            </label>
            <Input type="date" {...register("plan_date")} />
            {errors.plan_date && (
              <p className="text-sm text-destructive mt-1">
                {errors.plan_date.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">{t("form.status")} *</label>
            <Select
              value={watch("status")}
              onValueChange={(value) => setValue("status", value as PlanStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("form.selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plan">{t("status.plan")}</SelectItem>
                <SelectItem value="doing">{t("status.doing")}</SelectItem>
                <SelectItem value="complete">{t("status.complete")}</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive mt-1">
                {errors.status.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">{t("form.stage")}</label>
            <Input
              placeholder="e.g., Vegetative, Flowering, Fruiting"
              {...register("stage")}
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              {t("form.fertilizerType")}
            </label>
            <Input
              placeholder="e.g., NPK 10-10-10, Organic Compost"
              {...register("fertilizer_type")}
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t("form.amountKg")}</label>
            <Input
              type="number"
              step="0.1"
              placeholder="Amount in kilograms"
              {...register("amount_kg", { valueAsNumber: true })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t("form.details")}</label>
            <Textarea
              placeholder="Add notes about application method, weather conditions, etc..."
              {...register("detail")}
              rows={3}
            />
          </div>

          {/* Linked Expenses */}
          {expenses.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("form.linkRelatedExpenses")}
              </label>
              <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-2">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={expense.id}
                      checked={selectedExpenseIds.includes(expense.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedExpenseIds([
                            ...selectedExpenseIds,
                            expense.id,
                          ]);
                        } else {
                          setSelectedExpenseIds(
                            selectedExpenseIds.filter((id) => id !== expense.id)
                          );
                        }
                      }}
                    />
                    <label
                      htmlFor={expense.id}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {expense.categories?.name || t("common.uncategorized")} -
                      ${expense.amount.toFixed(2)}
                      <span className="text-muted-foreground ml-2">
                        ({expense.crops?.name || t("common.noCrop")})
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </EditModal>
    </div>
  );
};

export default FertilizerPlannerPage;
