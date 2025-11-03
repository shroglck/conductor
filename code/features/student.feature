Feature: Student Management with HTMX

  Scenario: Create a new student via HTMX
    Given a student with name "John Doe" and email "john.doe@example.com"
    When I create the student
    Then the student should be created successfully
    And the student should have the name "John Doe"
    And the student should have the email "john.doe@example.com"

  Scenario: Get all students via HTMX
    Given a student with name "Jane Doe" and email "jane.doe@example.com" has been created
    When I get all students
    Then the response should contain at least one student
    And the response should contain a student with name "Jane Doe"
    And the response should be accessible

  Scenario: Get a student by ID via HTMX
    Given a student with name "Jake Doe" and email "jake.doe@example.com" has been created
    When I get the student by their ID
    Then the student should be returned successfully
    And the student should have the name "Jake Doe"
    And the response should be accessible

  Scenario: Get a student by ID that does not exist via HTMX
    When I get a student by a non-existent ID
    Then the response status should be 404
    And the response should contain an error message
    And the response should be accessible

  Scenario: Navigate to create student form via HTMX
    When I navigate to the create student form
    Then the response status should be 200
    And the response should contain a form

  Scenario: Edit student form via HTMX
    Given a student with name "Sam Doe" and email "sam.doe@example.com" has been created
    When I edit the student
    Then the response status should be 200
    And the response should contain a form
    And the form should be prefilled with "Sam Doe" and "sam.doe@example.com"

  Scenario: Update student via HTMX
    Given a student with name "Original Name" and email "original@example.com" has been created
    When I update the student with "Updated Name" and "updated@example.com"
    Then the student should be updated successfully
    And the response should contain a success message
    And the response should be accessible

  Scenario: Delete student via HTMX
    Given a student with name "Delete Me" and email "delete@example.com" has been created
    When I delete the student
    Then the student should be deleted successfully

  Scenario: Handle validation errors in HTMX form
    Given a student with name "" and email "invalid-email"
    When I create the student
    Then the response status should be 400
    And the response should contain an error message
    And the response should be accessible

  Scenario: Handle duplicate email error via HTMX
    Given a student with name "First Student" and email "duplicate@example.com" has been created
    And a student with name "Second Student" and email "duplicate@example.com"
    When I create the student
    Then the response status should be 409
    And the response should contain an error message
