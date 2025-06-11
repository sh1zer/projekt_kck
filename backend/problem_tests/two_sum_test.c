#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

// --- USER CODE START ---
{user_code}
// --- USER CODE END ---

typedef struct {
    int* nums;
    int numsSize;
    int target;
    int* expected;
    int expectedSize;
} TestCase;

int main() {
    TestCase tests[] = {
        {
            .nums = (int[]){2, 7, 11, 15},
            .numsSize = 4,
            .target = 9,
            .expected = (int[]){0, 1},
            .expectedSize = 2
        },
        {
            .nums = (int[]){3, 2, 4},
            .numsSize = 3,
            .target = 6,
            .expected = (int[]){1, 2},
            .expectedSize = 2
        },
        {
            .nums = (int[]){3, 3},
            .numsSize = 2,
            .target = 6,
            .expected = (int[]){0, 1},
            .expectedSize = 2
        }
    };

    int num_tests = sizeof(tests) / sizeof(tests[0]);
    int all_passed = 1;

    for (int i = 0; i < num_tests; i++) {
        int* result = twoSum(tests[i].nums, tests[i].numsSize, tests[i].target);
        
        if (result == NULL) {
            printf("TEST_%d_STATUS=FAIL\n", i + 1);
            printf("TEST_%d_MESSAGE=Returned NULL\n", i + 1);
            all_passed = 0;
            continue;
        }

        bool test_passed = true;
        for (int j = 0; j < tests[i].expectedSize; j++) {
            if (result[j] != tests[i].expected[j]) {
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
                   tests[i].expected[0], tests[i].expected[1],
                   result[0], result[1]);
            all_passed = 0;
        }

        free(result);
    }

    return all_passed ? 0 : 1;
}
