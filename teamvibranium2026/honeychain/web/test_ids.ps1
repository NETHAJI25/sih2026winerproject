$ids=@('1504392022767-a8fc0771f239','1507003211169-0a1dd7228f2d','1490750967868-88aa4486c946','1441974231531-c6227db76b6e','1528821128474-27f963b062bf','1516594798947-e65505dbb29d','1462275646964-a0e3386b89fa','1448375240586-882707db888b','1416879595882-3373a0480b5b','1470509037663-253afd7f0f51','1473973266408-ed4e27abdd47','1587049352851-8d4e89133924','1558642084-fd43571d38ed')
foreach($id in $ids){
  try{
    $url = "https://images.unsplash.com/photo-$id`?w=200"
    Invoke-WebRequest -Uri $url -OutFile "public/test_$($id.Substring(0,8)).jpg" -UseBasicParsing
    $len=(Get-Item "public/test_$($id.Substring(0,8)).jpg").Length
    Write-Host "ok $id $len"
    Remove-Item "public/test_$($id.Substring(0,8)).jpg"
  } catch { Write-Host "fail $id" }
}
