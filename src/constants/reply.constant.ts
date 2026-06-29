type ApiResponse<T = unknown> = {
    status: "success" | "failed";
    response: string;
    data?: T;
};

export class ResponseBuilder {
    private build<T>(status: "success" | "failed", response: string, data?: T): ApiResponse<T> {
        if (data === undefined) {
            return {
                status,
                response
            };
        }

        return {
            status,
            response,
            data
        };
    }

    ok<T = unknown>(data?: T, message = "Action was successful") {
        return this.build("success", message, data);
    }

    created<T = unknown>(data?: T, message = "Created successfully") {
        return this.build("success", message, data);
    }

    badRequest<T = unknown>(data?: T, message = "You sent an invalid request") {
        return this.build("failed", message, data);
    }

    unauthorized<T = unknown>(data?: T, message = "You are not authorized") {
        return this.build("failed", message, data);
    }

    forbidden<T = unknown>(data?: T, message = "Access forbidden") {
        return this.build("failed", message, data);
    }

    notFound<T = unknown>(data?: T, message = "Resource not found") {
        return this.build("failed", message, data);
    }

    conflict<T = unknown>(data?: T, message = "Resource already exists") {
        return this.build("failed", message, data);
    }

    internalServerError<T = unknown>(data?: T, message = "Internal server error") {
        return this.build("failed", message, data);
    }
}