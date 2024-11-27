export const enum TestCaseDataType {
    TEXT = "Text",
    EMAIL = "Email",
    PASSWORD = "Password",
    SELECT = "Select",
    TEXTAREA = "Textarea",
    CHECKBOX = "Checkbox",
    RADIO_BUTTON = "Radio button",
    NUMBER = "Number",
    OTHER = "Other",
}

export const enum TestCaseDataValidation {
    REQUIRED = "Required",
    EMAIL = "Email",
    MINIMUM = "Minimun",
    DATE = "Date",
    UNIQUE = "Unique",
    ARRAY = "Array",
    FILE = "File",
}

export const enum TestCase {
    STEPS = "Steps",
    ADDITIONAL_STEPS = "Additional step item",
}

export const enum TestCaseStep {
    CONDITION = "Condition",
    IMPACT = "Impact",
    NOTES = "Notes",
}

export const aditionalStepTypes = [
    TestCaseStep.CONDITION,
    TestCaseStep.IMPACT,
    TestCaseStep.NOTES
];

export const testCaseAddList = [
    TestCase.STEPS,
    TestCase.ADDITIONAL_STEPS
];

export const TEST_CASE_DATA_VALIDATION_LIST = [
    TestCaseDataValidation.REQUIRED,
    TestCaseDataValidation.EMAIL,
    TestCaseDataValidation.MINIMUM,
    TestCaseDataValidation.DATE,
    TestCaseDataValidation.UNIQUE,
    TestCaseDataValidation.ARRAY,
    TestCaseDataValidation.FILE,
];

export const TEST_CASE_DATA_LIST = [
    TestCaseDataType.TEXT,
    TestCaseDataType.EMAIL,
    TestCaseDataType.PASSWORD,
    TestCaseDataType.SELECT,
    TestCaseDataType.TEXTAREA,
    TestCaseDataType.CHECKBOX,
    TestCaseDataType.RADIO_BUTTON,
    TestCaseDataType.NUMBER,
    TestCaseDataType.OTHER,
];