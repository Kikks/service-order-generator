import html2canvas from "html2canvas";

export const exportAsImage = async (
  elementId: string,
  fileName: string = "service-order.png",
): Promise<void> => {
  const element = document.getElementById(elementId);

  if (!element) {
    console.error("Element not found");
    return;
  }

  try {
    // Clone the element
    const clone = element.cloneNode(true) as HTMLElement;

    // Style the clone for exact export dimensions
    clone.style.position = "fixed";
    clone.style.top = "-9999px";
    clone.style.left = "-9999px";
    clone.style.width = "1080px";
    clone.style.height = "1350px";
    clone.style.maxHeight = "none";
    clone.style.margin = "0";
    clone.style.padding = "0";

    // Append to body
    document.body.appendChild(clone);

    // Wait for fonts and images to load
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Capture the clone
    const canvas = await html2canvas(clone, {
      width: 1080,
      height: 1350,
      scale: 1,
      backgroundColor: null,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // Remove the clone
    document.body.removeChild(clone);

    const link = document.createElement("a");
    link.download = fileName;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (error) {
    console.error("Error exporting image:", error);
  }
};
