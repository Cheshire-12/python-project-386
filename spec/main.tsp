import "@typespec/http";
import "./models.tsp";

using TypeSpec.Http;

@service(#{ title: "Call Calendar" })
@server("{endpoint}", "Call Calendar API", {
  endpoint: "http://localhost:8000",
})
namespace CallCalendar;

/**
 * Операции владельца календаря.
 * Владелец — заранее заданный профиль, админская часть не требует авторизации.
 */
@tag("Admin")
interface Admin {
  /**
   * Создать тип события.
   *
   * Правила:
   * - id задаёт сам владелец (slug: строчные латинские буквы, цифры, дефисы);
   * - durationMinutes должна быть положительной и кратной 30;
   * - при повторном использовании id возвращается 409.
   */
  @route("/api/admin/event-types")
  @post
  createEventType(@body body: CreateEventTypeRequest): CreatedResponse & EventType | DuplicateEventTypeIdError | ValidationError;

  /**
   * Страница предстоящих встреч.
   * В одном списке показаны бронирования всех типов событий,
   * отсортированные по времени начала (ближайшие сверху).
   */
  @route("/api/admin/bookings")
  @get
  listUpcomingBookings(): Booking[];
}

/** Операции гостя. Регистрация и вход не требуются. */
@tag("Guest")
interface GuestOperations {
  /**
   * Страница видов брони: название, описание и длительность
   * каждого типа событий.
   */
  @route("/api/event-types")
  @get
  listEventTypes(): EventTypeSummary[];

  /**
   * Свободные слоты выбранного типа события.
   *
   * Правила окна записи:
   * - слоты формируются на ближайшие 14 дней, начиная с текущей даты;
   * - from/to ограничивают выборку внутри этого окна и должны быть
   *   выровнены по сетке получасов;
   * - запрос за пределами окна возвращает 422;
   * - занятость считается глобально: слот помечается unavailable,
   *   если пересекается с бронью любого типа события.
   */
  @route("/api/event-types/{eventTypeId}/slots")
  @get
  listAvailableSlots(
    /** Идентификатор типа события. */
    @path eventTypeId: string,

    /** Начало запрашиваемого интервала (внутри 14-дневного окна). */
    @query from: utcDateTime,

    /** Конец запрашиваемого интервала; не позже now + 14 дней. */
    @query to: utcDateTime,
  ): Slot[] | NotFoundError | ValidationError;

  /**
   * Создать бронирование на выбранный свободный слот.
   *
   * Правила:
   * - записаться можно только на свободный слот из 14-дневного окна,
   *   выровненный по получасам (иначе 422);
   * - на одно и то же время нельзя создать две записи даже для разных
   *   типов событий — пересечение с существующей бронью даёт 409;
   * - endTime вычисляется как startTime + durationMinutes типа события;
   * - неизвестный eventTypeId даёт 404.
   */
  @route("/api/bookings")
  @post
  createBooking(@body body: CreateBookingRequest): CreatedResponse & Booking | NotFoundError | SlotConflictError | ValidationError;
}
