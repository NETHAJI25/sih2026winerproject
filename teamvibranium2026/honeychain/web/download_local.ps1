$map = @(
  @('https://images.unsplash.com/photo-1504392022767-a8fc0771f239?w=200&auto=format&fit=crop','public/species/cerana.jpg'),
  @('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop','public/species/mellifera.jpg'),
  @('https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?w=200&auto=format&fit=crop','public/species/dorsata.jpg'),
  @('https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=200&auto=format&fit=crop','public/species/florea.jpg'),
  @('https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=200&auto=format&fit=crop','public/species/trigona.jpg'),
  @('https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&auto=format&fit=crop','public/flora/mustard.jpg'),
  @('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&auto=format&fit=crop','public/flora/eucalyptus.jpg'),
  @('https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=200&auto=format&fit=crop','public/flora/litchi.jpg'),
  @('https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=200&auto=format&fit=crop','public/flora/jamun.jpg'),
  @('https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&auto=format&fit=crop','public/flora/forest.jpg'),
  @('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&auto=format&fit=crop','public/flora/neem.jpg'),
  @('https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=200&auto=format&fit=crop','public/flora/sunflower.jpg'),
  @('https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=200&auto=format&fit=crop','public/flora/moringa.jpg')
)
foreach($m in $map){
  Invoke-WebRequest -Uri $m[0] -OutFile $m[1] -UseBasicParsing
  Write-Host "ok $($m[1]) $((Get-Item $m[1]).Length)"
}
