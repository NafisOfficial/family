import Swal, { SweetAlertIcon } from "sweetalert2";

export function useSweetAlert() {
  const showSuccess = async (title: string, message?: string) => {
    return await Swal.fire({
      title,
      text: message,
      icon: "success",
      confirmButtonText: "OK",
    });
  };

  const showError = async (title: string, message?: string) => {
    return await Swal.fire({
      title,
      text: message,
      icon: "error",
      confirmButtonText: "OK",
    });
  };

  const showInfo = async (title: string, message?: string) => {
    return await Swal.fire({
      title,
      text: message,
      icon: "info",
      confirmButtonText: "OK",
    });
  };

  const showWarning = async (title: string, message?: string) => {
    return await Swal.fire({
      title,
      text: message,
      icon: "warning",
      confirmButtonText: "OK",
    });
  };

  const showConfirm = async (
    title: string,
    message?: string,
    confirmText = "Confirm",
    cancelText = "Cancel",
  ) => {
    return await Swal.fire({
      title,
      text: message,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
    });
  };

  const showToast = async (
    title: string,
    icon: SweetAlertIcon = "success",
    position:
      | "top"
      | "top-end"
      | "top-start"
      | "center"
      | "center-end"
      | "center-start"
      | "bottom"
      | "bottom-end"
      | "bottom-start" = "top-end",
  ) => {
    const Toast = Swal.mixin({
      toast: true,
      position,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });

    return await Toast.fire({
      icon,
      title,
    });
  };

  const showLoading = async (title: string = "Loading...") => {
    Swal.fire({
      title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  };

  const hideLoading = () => {
    Swal.close();
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showConfirm,
    showToast,
    showLoading,
    hideLoading,
  };
}
