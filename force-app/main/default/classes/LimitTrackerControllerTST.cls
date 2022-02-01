@isTest
public class LimitTrackerControllerTST {
   @isTest
    public static void testCase00(){
        LimitTrackerController controller = new LimitTrackerController();
        string res = LimitTrackerController.getLimits();
        system.assertNotEquals(null, res);
    }
}