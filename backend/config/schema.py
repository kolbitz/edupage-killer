import strawberry

import apps.accounts.schema as accounts_schema
import apps.assignments.schema as assignments_schema
import apps.attendance.schema as attendance_schema
import apps.chat.schema as chat_schema
import apps.materials.schema as materials_schema
import apps.notes.schema as notes_schema
import apps.timetable.schema as timetable_schema


@strawberry.type
class Query(
    accounts_schema.Query,
    timetable_schema.Query,
    attendance_schema.Query,
    materials_schema.Query,
    chat_schema.Query,
    assignments_schema.Query,
    notes_schema.Query,
):
    pass


@strawberry.type
class Mutation(
    accounts_schema.Mutation,
    timetable_schema.Mutation,
    attendance_schema.Mutation,
    materials_schema.Mutation,
    chat_schema.Mutation,
    assignments_schema.Mutation,
    notes_schema.Mutation,
):
    pass


schema = strawberry.Schema(query=Query, mutation=Mutation)
