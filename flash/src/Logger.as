package
{
	public class Logger
	{
		public function Logger()
		{
		}
		protected var _debugLog:Array = new Array();

		public function log(message:String):void
		{
			_debugLog.push(message);
		}
		
		public function debugLog():Array
		{
			return _debugLog;
		}
	}
}