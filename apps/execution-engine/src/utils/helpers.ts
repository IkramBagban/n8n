import prismaClient from "@repo/db";

export const updateExecutionStatus = async (
  executionId: string,
  status: "Starting" | "Running" | "Success" | "Error" | "Canceled" | "Crashed",
  finished: boolean = false
) => {
  try {
    const updateData: any = {
      status,
      finished,
    };

    if (status === "Running" && !finished) {
      updateData.startedAt = new Date();
    }

    if (finished) {
      updateData.stoppedAt = new Date();
    }

    await prismaClient.execution.update({
      where: { id: executionId },
      data: updateData,
    });
  } catch (error) {
    console.error(
      `Failed to update execution status for ${executionId}:`,
      error
    );
  }
};