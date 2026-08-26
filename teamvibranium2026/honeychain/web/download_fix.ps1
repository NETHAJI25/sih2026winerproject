$map = @(
  @('Apis%20florea%20worker%201.jpg','public/species/florea.jpg'),
  @('Tetragonula%20carbonaria%20f.jpg','public/species/trigona.jpg'),
  @('Mustard%20Growing%20in%20a%20Terraced%20Field%20in%20Ladakh%2C%20India%20(edit).jpg','public/flora/mustard.jpg'),
  @('Eucalyptus%20tereticornis%20flowers%2C%20capsules%2C%20buds%20and%20foliage.jpeg','public/flora/eucalyptus.jpg'),
  @('Litchi%20chinensis190714mx.jpg','public/flora/litchi.jpg'),
  @('Syzygium%20cumini%20(black%20plum).jpg','public/flora/jamun.jpg'),
  @('Azadirachta%20indica%20MHNT.BOT.2007.40.124.jpg','public/flora/neem.jpg')
)
foreach($m in $map){
  $url="https://commons.wikimedia.org/wiki/Special:FilePath/$($m[0])?width=320"
  try{
    Invoke-WebRequest -Uri $url -OutFile $m[1] -UseBasicParsing -Headers @{'User-Agent'='Mozilla/5.0'}
    Write-Host "ok $($m[1]) $((Get-Item $m[1]).Length)"
  } catch { Write-Host "fail $($m[0]) $($_.Exception.Message)" }
}
