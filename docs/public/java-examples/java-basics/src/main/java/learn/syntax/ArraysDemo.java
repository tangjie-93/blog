package learn.syntax;

import java.util.Arrays;

/**
 * 数组 Demo
 *
 * 【核心总结】
 * 数组三大特点：固定长度、同一类型、连续内存。
 * 三种初始化方式：
 *   int[] a = {1,2,3};          // 静态初始化
 *   int[] a = new int[5];       // 动态初始化（默认值0）
 *   int[] a = new int[]{1,2,3}; // 完整写法
 *
 * 【高频要点】
 * - 长度用 a.length（属性，不是方法），下标从 0 开始
 * - 超出范围抛 ArrayIndexOutOfBoundsException
 * - Arrays 工具类：sort/copyOf/toString/asList/binarySearch
 * - 二维数组本质是"数组的数组"，每行长度可以不同
 *
 * 【前端对比】
 * JS Array 动态、可变、可存任意类型；Java 数组固定长度、单一类型
 */
public class ArraysDemo {
    
    public static void main(String[] args) {
        System.out.println("========== 1. 数组的声明和初始化 ==========");
        
        int[] arr1 = {1, 2, 3, 4, 5};
        System.out.println("arr1: " + Arrays.toString(arr1));
        
        int[] arr2 = new int[5];
        System.out.println("arr2 (默认值): " + Arrays.toString(arr2));
        Arrays.fill(arr2, 100);
        System.err.println("arr2  填充值: " + Arrays.toString(arr2));
        
        int[] arr3 = new int[]{10, 20, 30};
        System.out.println("arr3: " + Arrays.toString(arr3));
        
        double[] doubleArr = {1.1, 2.2, 3.3};
        String[] stringArr = {"Java", "Python", "Go"};
        boolean[] boolArr = {true, false, true};
        
        System.out.println("doubleArr: " + Arrays.toString(doubleArr));
        System.out.println("stringArr: " + Arrays.toString(stringArr));
        System.out.println("boolArr: " + Arrays.toString(boolArr));
        
        System.out.println("\n========== 2. 访问和修改数组元素 ==========");
        
        int[] numbers = {10, 20, 30, 40, 50};
        
        System.out.println("第一个元素: " + numbers[0]);
        System.out.println("最后一个元素: " + numbers[numbers.length - 1]);
        
        numbers[2] = 35;
        System.out.println("修改后: " + Arrays.toString(numbers));
        System.out.println("数组长度: " + numbers.length);
        
        System.out.println("\n========== 3. 遍历数组 ==========");
        
        String[] fruits = {"Apple", "Banana", "Cherry"};
        
        System.out.println("普通for循环:");
        for (int i = 0; i < fruits.length; i++) {
            System.out.println("  " + i + ": " + fruits[i]);
        }
        
        System.out.println("增强for循环:");
        for (String fruit : fruits) {
            System.out.println("  " + fruit);
        }
        
        System.out.println("\n========== 4. 二维数组 ==========");
        
        int[][] matrix1 = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9}
        };
        
        System.out.println("二维数组matrix1:");
        for (int[] row : matrix1) {
            System.out.println("  " + Arrays.toString(row));
        }
        
        int[][] matrix2 = new int[3][4];
        for (int i = 0; i < matrix2.length; i++) {
            for (int j = 0; j < matrix2[i].length; j++) {
                matrix2[i][j] = i * matrix2[i].length + j + 1;
            }
        }
        
        System.out.println("二维数组matrix2:");
        for (int[] row : matrix2) {
            System.out.println("  " + Arrays.toString(row));
        }
        
        System.out.println("matrix1[1][2] = " + matrix1[1][2]);
        
        System.out.println("\n========== 5. 数组常用操作 ==========");
        
        int[] arr = {5, 2, 8, 1, 9, 3, 7, 4, 6};
        System.out.println("原数组: " + Arrays.toString(arr));
        
        Arrays.sort(arr);
        System.out.println("排序后: " + Arrays.toString(arr));
        
        Integer[] intArr = {5, 2, 8, 1, 9};
        Arrays.sort(intArr, (a, b) -> b - a);
        System.out.println("降序排序: " + Arrays.toString(intArr));
        Arrays.sort(intArr, (a, b) -> a - b);
        System.out.println("升序排序: " + Arrays.toString(intArr));
        
        int[] sortedArr = {1, 2, 3, 4, 5, 6, 7, 8, 9};
        int index = Arrays.binarySearch(sortedArr, 5);
        System.out.println("5的索引: " + index);
        
        int[] fillArr = new int[5];
        Arrays.fill(fillArr, 100);
        System.out.println("填充后: " + Arrays.toString(fillArr));
        
        int[] copyArr = Arrays.copyOf(arr, 5);
        System.out.println("复制前5个: " + Arrays.toString(copyArr));
        
        int[] arrA = {1, 2, 3};
        int[] arrB = {1, 2, 3};
        
        System.out.println("arrA == arrB: " + (arrA == arrB));
        // 数组比较 判断是否相等，不判断元素顺序
        System.out.println("Arrays.equals(arrA, arrB): " + Arrays.equals(arrA, arrB));
        
        System.out.println("\n========== 6. 实战示例 ==========");
        
        int[] values = {23, 45, 12, 67, 34, 89, 56};
        int max = values[0];
        for (int value : values) {
            if (value > max) {
                max = value;
            }
        }
        System.out.println("最大值: " + max);
        
        int[] original = {1, 2, 3, 4, 5};
        int[] reversed = new int[original.length];
        for (int i = 0; i < original.length; i++) {
            reversed[i] = original[original.length - 1 - i];
        }
        System.out.println("原数组: " + Arrays.toString(original));
        System.out.println("反转后: " + Arrays.toString(reversed));
    }
}
