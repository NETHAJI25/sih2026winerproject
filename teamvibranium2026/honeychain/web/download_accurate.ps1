$map = @(
  @('Apis%20cerana.jpg','public/species/cerana.jpg'),
  @('Apis%20mellifera%20Western%20honey%20bee.jpg','public/species/mellifera.jpg'),
  @('Apis%20dorsata.jpg','public/species/dorsata.jpg'),
  @('Apis%20florea.jpg','public/species/florea.jpg'),
  @('Tetragonula%20carbonaria.jpg','public/species/trigona.jpg'),
  @('Brassica%20nigra.jpg','public/flora/mustard.jpg'),
  @('Eucalyptus%20melliodora%20flowers.jpg','public/flora/eucalyptus.jpg'),
  @('Litchi%20chinensis%20fruits.jpg','public/flora/litchi.jpg'),
  @('Syzygium%20cumini%20fruits.jpg','public/flora/jamun.jpg'),
  @('Moringa%20oleifera.jpg','public/flora/moringa.jpg'),
  @('Azadirachta%20indica%20leaves%20and%20flowers.jpg','public/flora/neem.jpg'),
  @('Sunflower%20sky%20backdrop.jpg','public/flora/sunflower.jpg')
)
foreach($m in $map){
  $url="https://commons.wikimedia.org/wiki/Special:FilePath/$($m[0])?width=320"
  try{
    Invoke-WebRequest -Uri $url -OutFile $m[1] -UseBasicParsing -Headers @{'User-Agent'='Mozilla/5.0'}
    Write-Host "ok $($m[1]) $((Get-Item $m[1]).Length)"
  } catch { Write-Host "fail $($m[0]) $($_.Exception.Message)" }
}
