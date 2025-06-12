#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

{user_code}

typedef struct {
    int* input_array;
    int array_size;
    int target;
    int* expected_output;
    int expected_size;
} TestCase;

int main() {
    TestCase tests[] = {
        {
            .input_array = (int[]){1, 2, 3},
            .array_size = 3,
            .target = 5,
            .expected_output = (int[]){1, 2},
            .expected_size = 2
        },
    };

    int num_tests = sizeof(tests) / sizeof(tests[0]);
    int all_passed = 1;

    for (int i = 0; i < num_tests; i++) {
        int* result = yourFunction(tests[i].input_array, tests[i].array_size, tests[i].target);
        
        if (result == NULL) {
            printf("TEST_%d_STATUS=FAIL\n", i + 1);
            printf("TEST_%d_MESSAGE=Returned NULL\n", i + 1);
            all_passed = 0;
            continue;
        }

        bool test_passed = true;
        for (int j = 0; j < tests[i].expected_size; j++) {
            if (result[j] != tests[i].expected_output[j]) {
                test_passed = false;
                break;
            }
        }

        if (test_passed) {
            printf("TEST_%d_STATUS=PASS\n", i + 1);
            printf("TEST_%d_MESSAGE=\n", i + 1);
        } else {
            printf("TEST_%d_STATUS=FAIL\n", i + 1);
            printf("TEST_%d_MESSAGE=Expected [%d, %d], Got [%d, %d]\n", 
                   i + 1, 
                   tests[i].expected_output[0], tests[i].expected_output[1],
                   result[0], result[1]);
            all_passed = 0;
        }

        free(result);
    }

    return all_passed ? 0 : 1;
} 