import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn, getDuration } from "@/lib/utils";
import { updatePlanStatus } from "@/services/fertilizerService";
import type { Crop, FertilizerPlan } from "@/types";
import type { DropResult } from "@hello-pangea/dnd";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

interface Column {
  id: string;
  title: string;
  type: "planned" | "doing" | "complete";
  plans: FertilizerPlan[];
}

interface KanbanBoardProps {
  plans: FertilizerPlan[];
  crops: Crop[];
  onStatusUpdate: (plan: FertilizerPlan) => void;
  onClick: (plan: FertilizerPlan) => void;
}

const getBackgroundColor = (type: Column["type"]) => {
  switch (type) {
    case "planned":
      return "bg-secondary/20";
    case "doing":
      return "bg-blue-500/20";
    case "complete":
      return "bg-green-500/20";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "planned":
      return "bg-secondary text-secondary-foreground";
    case "doing":
      return "bg-blue-500 text-white";
    case "complete":
      return "bg-green-500 text-white";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

export const KanbanBoard = ({
  plans,
  crops,
  onStatusUpdate,
  onClick
}: KanbanBoardProps) => {
  const { t, language } = useLanguage();

  const columns: Column[] = [
    {
      id: "planned",
      title: t("status.plan"),
      type: "planned",
      plans: plans.filter((p) => p.status === "plan"),
    },
    {
      id: "doing",
      title: t("status.doing"),
      type: "doing",
      plans: plans.filter((p) => p.status === "doing"),
    },
    {
      id: "complete",
      title: t("status.complete"),
      type: "complete",
      plans: plans.filter((p) => p.status === "complete"),
    },
  ];

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If there's no destination, or dropping in the same place
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const plan = plans.find((p) => p.id === draggableId);
    if (!plan) return;

    try {
      const updatedPlan = await updatePlanStatus(
        plan.id,
        destination.droppableId as any
      );
      onStatusUpdate(updatedPlan);
    } catch (error) {
      console.error("Failed to update plan status:", error);
    }
  };
  const getCropStartDateByCropId = (crop_id: any) => {
    const crop = crops.find((el) => el.id === crop_id);
    return crop?.started_date || new Date().toDateString();
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="overflow-x-auto pb-4 -mx-6 px-6">
        <div className="inline-flex md:grid md:grid-cols-3 gap-6 min-w-[calc(100vw-2rem)] md:min-w-0">
          {columns.map((column) => (
            <div
              key={column.id}
              className="flex flex-col h-full w-[85vw] md:w-full flex-shrink-0"
            >
              <h3 className="font-semibold mb-4">
                {column.title}{" "}
                <span className="text-muted-foreground">
                  ({column.plans.length})
                </span>
              </h3>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex-1 rounded-lg p-4 min-h-[500px]",
                      getBackgroundColor(column.type),
                      snapshot.isDraggingOver && "ring-2 ring-primary"
                    )}
                  >
                    <div className="space-y-4">
                      {column.plans.map((plan, index) => (
                        <Draggable
                          key={plan.id}
                          draggableId={plan.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                "bg-background",
                                snapshot.isDragging &&
                                  "ring-2 ring-primary shadow-lg"
                              )}
                              onClick={()=>onClick(plan)}
                            >
                              <CardHeader className="p-4">
                                <CardTitle className="text-base">
                                  {plan.crops?.name}
                                </CardTitle>
                                <CardDescription>
                                  {new Date(
                                    plan.plan_date
                                  ).toLocaleDateString()}{" "}
                                  (
                                  {getDuration(
                                    getCropStartDateByCropId(plan.crop_id),
                                    plan.plan_date,
                                    language
                                  )}
                                  )
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="p-4 pt-0">
                                <div className="flex flex-wrap gap-2">
                                  <Badge>{plan.fertilizer_type}</Badge>
                                  <Badge variant="outline">
                                    {plan.amount_kg} kg
                                  </Badge>
                                  <Badge
                                    className={getStatusColor(plan.status)}
                                  >
                                    {t(`status.${plan.status}`)}
                                  </Badge>
                                </div>
                                {plan.detail && (
                                  <p className="text-sm text-muted-foreground mt-2">
                                    {plan.detail}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
};
